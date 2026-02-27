import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import warnings
warnings.filterwarnings('ignore')

print("=" * 70)
print("ADVANCED USER BEHAVIOR ANALYSIS - 3 PARAMETER MODEL")
print("=" * 70)

# Load dataset
print("\n[1/7] Loading security logs...")
df = pd.read_csv('security_logs_10k.csv')
print(f"   Loaded {len(df)} records")

# Feature Engineering
print("\n[2/7] Engineering behavioral features...")
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['hour'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek
df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)

# ============================================================================
# PARAMETER 1: TEMPORAL ANALYSIS (Z-Score for unusual hours)
# ============================================================================
print("\n[3/7] TEMPORAL ANALYSIS - Computing Z-scores for login times...")

# Calculate user's normal hours
user_hour_stats = df.groupby('user')['hour'].agg(['mean', 'std']).reset_index()
user_hour_stats.columns = ['user', 'hour_mean', 'hour_std']
user_hour_stats['hour_std'] = user_hour_stats['hour_std'].fillna(1)  # Avoid division by zero

# Merge back to main dataframe
df = df.merge(user_hour_stats, on='user', how='left')

# Calculate Z-score: how many std deviations from normal
df['temporal_zscore'] = np.abs((df['hour'] - df['hour_mean']) / df['hour_std'])
df['temporal_anomaly'] = (df['temporal_zscore'] > 2).astype(int)  # Flag if >2 std dev

print(f"   Temporal anomalies detected: {df['temporal_anomaly'].sum()}")
print(f"   Average Z-score: {df['temporal_zscore'].mean():.2f}")

# ============================================================================
# PARAMETER 2: VOLUME ANALYSIS (File access rate per user)
# ============================================================================
print("\n[4/7] VOLUME ANALYSIS - Computing file access rates...")

# Sort by user and timestamp
df = df.sort_values(['user', 'timestamp'])

# Count files accessed per user per hour window
df['date_hour'] = df['timestamp'].dt.floor('h')
volume_stats = df.groupby(['user', 'date_hour']).size().reset_index(name='files_per_hour')

# Calculate normal volume per user
user_volume_stats = volume_stats.groupby('user')['files_per_hour'].agg(['mean', 'std']).reset_index()
user_volume_stats.columns = ['user', 'volume_mean', 'volume_std']
user_volume_stats['volume_std'] = user_volume_stats['volume_std'].fillna(1)

# Merge volume stats
df = df.merge(volume_stats, on=['user', 'date_hour'], how='left')
df = df.merge(user_volume_stats, on='user', how='left')

# Calculate volume Z-score
df['volume_zscore'] = np.abs((df['files_per_hour'] - df['volume_mean']) / df['volume_std'])
df['volume_anomaly'] = (df['volume_zscore'] > 2).astype(int)

print(f"   Volume anomalies detected: {df['volume_anomaly'].sum()}")
print(f"   Average files per hour: {df['files_per_hour'].mean():.2f}")

# ============================================================================
# PARAMETER 3: SEQUENTIAL PATTERN ANALYSIS (Markov Chain transitions)
# ============================================================================
print("\n[5/7] SEQUENTIAL ANALYSIS - Building Markov Chain transitions...")

# Create sequence of file accesses per user
df['prev_file'] = df.groupby('user')['file_accessed'].shift(1)
df['file_transition'] = df['prev_file'] + ' -> ' + df['file_accessed']

# Calculate transition probabilities for each user
transition_counts = df.groupby(['user', 'file_transition']).size().reset_index(name='count')
user_total_transitions = transition_counts.groupby('user')['count'].sum().reset_index(name='total')
transition_counts = transition_counts.merge(user_total_transitions, on='user')
transition_counts['transition_prob'] = transition_counts['count'] / transition_counts['total']

# Merge transition probabilities
df = df.merge(transition_counts[['user', 'file_transition', 'transition_prob']], 
              on=['user', 'file_transition'], how='left')
df['transition_prob'] = df['transition_prob'].fillna(0.01)  # Low prob for unseen transitions

# Flag low probability transitions as anomalies
df['sequential_anomaly'] = (df['transition_prob'] < 0.1).astype(int)

print(f"   Sequential anomalies detected: {df['sequential_anomaly'].sum()}")
print(f"   Average transition probability: {df['transition_prob'].mean():.3f}")

# ============================================================================
# COMBINED ANOMALY SCORE
# ============================================================================
print("\n[6/7] Computing combined anomaly score...")

# Weighted anomaly score (all three parameters)
df['anomaly_score'] = (
    0.4 * df['temporal_zscore'] + 
    0.3 * df['volume_zscore'] + 
    0.3 * (1 - df['transition_prob']) * 10  # Scale transition prob
)

# Encode categorical variables
encoders = {}
categorical_cols = ['log_type', 'account', 'device_type', 'location', 'department', 'file_accessed']

for col in categorical_cols:
    le = LabelEncoder()
    df[col + '_encoded'] = le.fit_transform(df[col])
    encoders[col] = le

# Select features for training
feature_cols = [
    'hour', 'day_of_week', 'is_weekend',
    'temporal_zscore', 'temporal_anomaly',
    'volume_zscore', 'volume_anomaly', 'files_per_hour',
    'transition_prob', 'sequential_anomaly',
    'anomaly_score'
] + [col + '_encoded' for col in categorical_cols]

# Remove rows with NaN (first entries without previous transitions)
df_clean = df.dropna(subset=feature_cols)

X = df_clean[feature_cols]
y = df_clean['is_anomaly']

print(f"   Features: {len(feature_cols)}")
print(f"   Training samples: {len(X)}")
print(f"   Normal: {(y==0).sum()}, Anomalies: {(y==1).sum()}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Train model
print("\n[7/7] Training Random Forest with 3-parameter features...")
rf_model = RandomForestClassifier(n_estimators=150, max_depth=25, random_state=42, n_jobs=-1)
rf_model.fit(X_train, y_train)

# Predictions
y_pred = rf_model.predict(X_test)
y_pred_proba = rf_model.predict_proba(X_test)[:, 1]

# Evaluation
print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"   True Negatives:  {cm[0][0]:4d} | False Positives: {cm[0][1]:4d}")
print(f"   False Negatives: {cm[1][0]:4d} | True Positives:  {cm[1][1]:4d}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Normal', 'Anomaly']))

# Feature importance
print("\nTop 15 Most Important Features:")
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False).head(15)

for idx, row in feature_importance.iterrows():
    print(f"   {row['feature']:30s}: {row['importance']:.4f}")

# Save model
print("\n" + "=" * 70)
print("SAVING MODEL & ARTIFACTS")
print("=" * 70)
joblib.dump(rf_model, 'behavior_anomaly_model.pkl')
joblib.dump(encoders, 'encoders.pkl')
joblib.dump(feature_cols, 'feature_cols.pkl')
joblib.dump(user_hour_stats, 'user_hour_stats.pkl')
joblib.dump(user_volume_stats, 'user_volume_stats.pkl')
print("   Saved: behavior_anomaly_model.pkl")
print("   Saved: encoders.pkl")
print("   Saved: feature_cols.pkl")
print("   Saved: user_hour_stats.pkl")
print("   Saved: user_volume_stats.pkl")

# Sample predictions with 3-parameter analysis
print("\n" + "=" * 70)
print("SAMPLE PREDICTIONS - 3 PARAMETER ANALYSIS")
print("=" * 70)

anomaly_samples = df_clean[df_clean['is_anomaly'] == 1].head(5)
for idx, row in anomaly_samples.iterrows():
    sample_features = row[feature_cols].values.reshape(1, -1)
    prediction = rf_model.predict(sample_features)[0]
    probability = rf_model.predict_proba(sample_features)[0][1]
    
    print(f"\nSample {idx}:")
    print(f"   User: {row['user']}, Dept: {row['department']}")
    print(f"   Time: {row['timestamp'].strftime('%Y-%m-%d %H:%M')}, Location: {row['location']}")
    print(f"   File: {row['file_accessed']}")
    print(f"   TEMPORAL:   Z-score = {row['temporal_zscore']:.2f} (Normal: {row['hour_mean']:.1f}h)")
    print(f"   VOLUME:     {row['files_per_hour']:.0f} files/hr (Normal: {row['volume_mean']:.1f})")
    print(f"   SEQUENTIAL: Transition prob = {row['transition_prob']:.3f}")
    print(f"   ANOMALY SCORE: {row['anomaly_score']:.2f}")
    print(f"   Prediction: {'ANOMALY' if prediction == 1 else 'NORMAL'} (Confidence: {probability*100:.1f}%)")

print("\n" + "=" * 70)
print("TRAINING COMPLETE!")
print("=" * 70)
print("\nModel uses 3 parameters:")
print("1. TEMPORAL: Z-score analysis for unusual login times")
print("2. VOLUME: File access rate anomalies")
print("3. SEQUENTIAL: Markov Chain transition probabilities")
print("\nReady for deployment!")