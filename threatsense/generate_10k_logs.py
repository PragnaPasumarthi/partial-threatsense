import pandas as pd
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()
random.seed(42)
Faker.seed(42)

# Behavioral baselines for each department
DEPARTMENTS = {
    'Owner': {
        'locations': ['NYC_HQ', 'London', 'Remote_VPN'],
        'hours': range(8, 20),
        'files': ['financial', 'contracts', 'hr', 'operations'],
        'count': 50
    },
    'Operations': {
        'locations': ['NYC_HQ'],
        'hours': range(7, 19),
        'files': ['inventory', 'schedules', 'orders'],
        'count': 150
    },
    'Finance': {
        'locations': ['NYC_HQ'],
        'hours': range(9, 18),
        'files': ['accounting', 'invoices', 'payroll', 'bank'],
        'count': 200
    },
    'Sales': {
        'locations': ['NYC_HQ', 'London', 'Remote_VPN'],
        'hours': range(8, 19),
        'files': ['crm', 'marketing', 'customer_db'],
        'count': 200
    },
    'HR': {
        'locations': ['NYC_HQ'],
        'hours': range(9, 17),
        'files': ['employee_records', 'contracts', 'training'],
        'count': 100
    },
    'Support': {
        'locations': ['NYC_HQ', 'London'],
        'hours': range(8, 18),
        'files': ['calendars', 'customer_inquiries', 'shared'],
        'count': 200
    }
}

LOG_TYPES = ['windows_security_event', 'file_access', 'firewall_log', 'vpn_connection']

def generate_normal_logs(total=9000):
    logs = []
    start_date = datetime(2024, 1, 1)
    
    for dept, config in DEPARTMENTS.items():
        dept_count = int(total * config['count'] / 900)
        users = [f"{dept.lower()}_user{i:02d}" for i in range(1, 21)]
        
        for _ in range(dept_count):
            user = random.choice(users)
            days_offset = random.randint(0, 180)
            hour = random.choice(config['hours'])
            timestamp = start_date + timedelta(days=days_offset, hours=hour, minutes=random.randint(0, 59))
            
            # Skip weekends for most departments
            if timestamp.weekday() >= 5 and dept not in ['Owner', 'Sales']:
                continue
            
            logs.append({
                'timestamp': timestamp.isoformat(),
                'log_type': random.choice(['windows_security_event', 'file_access', 'firewall_log']),
                'user': user,
                'account': dept,
                'hostname': f"WS-{random.randint(1, 100):03d}",
                'device_type': 'workstation',
                'location': random.choice(config['locations']),
                'department': dept,
                'file_accessed': random.choice(config['files']),
                'ip_address': fake.ipv4(),
                'is_anomaly': 0
            })
    
    return logs[:9000]

def generate_anomaly_logs(total=1000):
    logs = []
    start_date = datetime(2024, 1, 1)
    
    anomaly_types = [
        # Impossible Travel
        lambda: {
            'dept': random.choice(['Finance', 'Sales', 'HR']),
            'hour': random.randint(9, 17),
            'location': 'London',
            'file': random.choice(['accounting', 'crm', 'employee_records']),
            'log_type': 'vpn_connection',
            'note': 'impossible_travel'
        },
        # Time Anomaly (off-hours)
        lambda: {
            'dept': random.choice(['Finance', 'HR', 'Operations']),
            'hour': random.choice([2, 3, 4, 23]),
            'location': random.choice(['NYC_HQ', 'Remote_VPN']),
            'file': random.choice(['payroll', 'bank', 'employee_records']),
            'log_type': 'file_access',
            'note': 'time_anomaly'
        },
        # Role Violation (unauthorized file access)
        lambda: {
            'dept': 'Support',
            'hour': random.randint(9, 17),
            'location': random.choice(['NYC_HQ', 'Proxy']),
            'file': random.choice(['payroll', 'bank', 'financial']),
            'log_type': 'file_access',
            'note': 'role_violation'
        },
        # Location Anomaly
        lambda: {
            'dept': random.choice(['Finance', 'HR', 'Operations']),
            'hour': random.randint(9, 17),
            'location': random.choice(['Proxy', 'Unknown']),
            'file': random.choice(['accounting', 'payroll', 'contracts']),
            'log_type': 'defender_atp_alert',
            'note': 'location_anomaly'
        },
        # Weekend Activity
        lambda: {
            'dept': random.choice(['Finance', 'HR']),
            'hour': random.randint(10, 16),
            'location': 'Remote_VPN',
            'file': random.choice(['payroll', 'bank', 'employee_records']),
            'log_type': 'vpn_connection',
            'note': 'weekend_activity'
        }
    ]
    
    for _ in range(total):
        anomaly = random.choice(anomaly_types)()
        days_offset = random.randint(0, 180)
        timestamp = start_date + timedelta(days=days_offset, hours=anomaly['hour'], minutes=random.randint(0, 59))
        
        # Force weekend for weekend_activity
        if anomaly.get('note') == 'weekend_activity':
            timestamp = timestamp + timedelta(days=(5 - timestamp.weekday()) % 7)
        
        dept = anomaly['dept']
        users = [f"{dept.lower()}_user{i:02d}" for i in range(1, 21)]
        
        logs.append({
            'timestamp': timestamp.isoformat(),
            'log_type': anomaly['log_type'],
            'user': random.choice(users),
            'account': dept,
            'hostname': f"WS-{random.randint(1, 100):03d}",
            'device_type': random.choice(['workstation', 'server']),
            'location': anomaly['location'],
            'department': dept,
            'file_accessed': anomaly['file'],
            'ip_address': fake.ipv4(),
            'is_anomaly': 1
        })
    
    return logs

print("Generating 9,000 normal logs...")
normal_logs = generate_normal_logs(9000)

print("Generating 1,000 anomaly logs...")
anomaly_logs = generate_anomaly_logs(1000)

# Combine and shuffle
all_logs = normal_logs + anomaly_logs
random.shuffle(all_logs)

# Create DataFrame
df = pd.DataFrame(all_logs)
df = df.sort_values('timestamp').reset_index(drop=True)

# Save to CSV
df.to_csv('security_logs_10k.csv', index=False)

print(f"\nGenerated {len(df)} security logs")
print(f"  Normal: {len(normal_logs)} (90%)")
print(f"  Anomalies: {len(anomaly_logs)} (10%)")
print(f"\nDepartment distribution:")
print(df['department'].value_counts())
print(f"\nAnomaly distribution:")
print(df['is_anomaly'].value_counts())
print(f"\nDate range: {df['timestamp'].min()} to {df['timestamp'].max()}")
print(f"\nSaved to: security_logs_10k.csv")