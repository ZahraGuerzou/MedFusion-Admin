MedFusion AI — Admin Platform UI/UX Guide
Frontend Development Documentation

This document defines the complete structure and behavior of the MedFusion AI Admin Platform.

The Admin Platform is the central federated AI orchestration system responsible for:

federated learning management
hospital management
model deployment
aggregation monitoring
subscriptions
analytics
GENERAL DESIGN GUIDELINES
Theme

The platform must look:

professional
medical
modern
AI-oriented
Main Colors
Color	Usage
Green	Success / medical
Dark Blue	Main primary
White	Background
Light Gray	Cards
Red	Alerts/errors
Layout

Use:

left sidebar navigation
top navbar
responsive dashboard cards
rounded cards
charts and tables
Sidebar Sections
Dashboard
Hospitals
Federated Models
FL Rounds
Aggregation Engine
Analytics
Subscriptions
Notifications
Audit Logs
Settings
TOP NAVBAR

Contains:

MedFusion AI logo
admin profile
notifications icon
search bar
dark/light mode
1. DASHBOARD PAGE
Purpose

Global overview of the ecosystem.

Sections
A. Statistics Cards

4 cards at top.

Example:

Card	Value
Total Hospitals	18
Active FL Models	12
Running FL Rounds	5
Premium Subscribers	9
UI Behavior
animated counters
hover effects
clickable cards
B. Active Federated Models Table
Model ID	Modality	Round	Status
MRI-EFF-v1.4	MRI	15	Running
Status Colors
Status	Color
Running	Green
Aggregating	Blue
Failed	Red
Pending	Orange
C. Recent Activity Feed

Scrollable activity panel.

Example:

Hospital_03 uploaded local update.
MRI-EFF-v1.4 deployed.
Round 15 aggregation completed.
D. Quick Actions

Buttons:

Upload Federated Model
Start FL Round
Assign Hospitals
Manage Subscriptions
2. HOSPITALS PAGE
Purpose

Manage all hospitals and institutions.

Main Layout
A. Hospitals Table

Columns:

Column
Hospital Name
Subscription Plan
Active Models
Participation Rate
Status
Actions
Row Actions

Buttons:

View
Edit
Suspend
Assign Models
B. Hospital Details Page

When clicking "View".

Sections
General Information
Field	Example
Hospital Name	CHU Alger
Country	Algeria
Registered Date	Jan 2026
Plan	Premium
Team Information
Field	Value
Doctors	12
AI Team Members	4
Participation Statistics

Charts:

rounds participation
uploads over time
local accuracy evolution
Assigned Models Section

Cards showing:

modality
architecture
version
status
3. FEDERATED MODELS PAGE
Purpose

Central model registry.

Main Layout
A. Upload Federated Model Section

Large upload area.

Drag-and-drop style.

Accepted Files
.zip
.tar
.pth
Upload Process

After upload:
backend extracts metadata automatically.

B. Extracted Model Information Card
Field	Example
Model ID	MRI-EFF-v1.4
Modality	Brain MRI
Backbone	EfficientNetV2
Version	v1.4
Aggregation	SSL Adaptive
Explainability	Grad-CAM
C. Model Registry Table

Columns:

Column
Model ID
Modality
Backbone
Version
Status
Hospitals
Last Update
Actions
Actions
Validate
Approve
Assign
Deploy
Delete
D. Model Status Badge
Status	Color
Experimental	Gray
Validation	Orange
Clinical Approved	Green
Deprecated	Red
4. MODEL ASSIGNMENT PAGE
Purpose

Assign uploaded models to hospitals.

Layout
A. Selected Model Card

Shows:

modality
architecture
version
compatibility
B. Hospitals Selection Table

Checkbox list.

Hospital	Plan	Compatible
CHU Alger	Premium	Yes
C. Generate Client Package Button

Button:

Generate Training Package
Result

Automatically creates:

fedsara_client_package.zip
5. FEDERATED ROUNDS PAGE
Purpose

Manage communication rounds.

Layout
A. Round Overview Card
Field	Value
Round Number	15
Model	MRI-EFF-v1.4
Status	Running
Started At	10:30 AM
B. Participating Hospitals Table
Hospital	Upload Status	Local Accuracy	Samples
CHU Alger	Uploaded	96.8%	4200
Upload Status Colors
Status	Color
Uploaded	Green
Pending	Orange
Failed	Red
C. Round Control Buttons
Start Round
Stop Round
Aggregate
Deploy Global Model
D. Round Timeline

Visual progress tracker.

Example:

Start
↓
Client Training
↓
Uploads Received
↓
Aggregation
↓
Deployment
6. AGGREGATION ENGINE PAGE
Purpose

Visualize SSL-guided adaptive aggregation.

VERY IMPORTANT PAGE.

Layout
A. Aggregation Method Card
SSL-Guided Adaptive Aggregation
B. Contribution Weights Table
Hospital	Aggregation Weight
CHU Alger	0.24
C. Metrics Used Cards

Cards for:

dataset size
local accuracy
SSL divergence
reliability score
D. Charts

Charts:

convergence curve
global accuracy evolution
contribution distribution
E. Aggregation Logs

Terminal-style logs viewer.

7. ANALYTICS PAGE
Purpose

Monitor global AI performance.

Sections
A. Accuracy Evolution Chart

Round vs Accuracy.

B. Loss Curve

Round vs Loss.

C. Architecture Comparison Table
Architecture	Modality	Accuracy
ResNet18	CXR	97.2%
D. Participation Analytics

Charts:

hospital activity
uploads frequency
modality usage
E. Explainability Monitoring

Gallery of:

Grad-CAM heatmaps
attention maps
representative cases
8. SUBSCRIPTIONS PAGE
Purpose

Manage SaaS plans and monetization.

Layout
A. Subscription Plans Cards

3 pricing cards.

Free Plan
0 DZD
5 diagnoses/month
Limited models
No AI team access
Standard Plan
2000 DZD
100 diagnoses/month
Explainability enabled
Partial AI team access
Premium Plan
4000 DZD
Unlimited diagnoses
Full FL participation
All modalities
B. Hospitals Subscription Table
Hospital	Plan	Expiration	Usage
CHU Alger	Premium	June 2026	78%
C. Usage Monitoring

Progress bars for:

diagnosis usage
storage
active models
D. Subscription Actions

Buttons:

Upgrade
Renew
Suspend
Limit Access
E. Usage Limit Alerts

Example popup:

Free plan limit reached.
Upgrade to continue using MedFusion AI.
9. NOTIFICATIONS PAGE
Purpose

Centralized alerts.

Notification Types
Type	Example
FL Round	Round 15 completed
Upload	Hospital uploaded update
Subscription	Plan expired
Security	Failed validation
UI
notification cards
unread badge
filter by type
10. AUDIT LOGS PAGE
Purpose

Security and traceability.

Table Columns
User	Action	Time	Status
Admin	Deployed MRI model	10:22 AM	Success
Filters

Filter by:

user
date
action type
Export Options

Buttons:

Export CSV
Export PDF
11. SETTINGS PAGE
Sections
A. General Settings
platform name
logo upload
maintenance mode
B. Security Settings
2FA
password policy
session timeout
C. FL Configuration
Setting	Example
Default Rounds	15
Aggregation Timeout	24h
D. Email & Notifications
SMTP config
notification preferences
E. Theme Settings
dark/light mode
accent colors
FRONTEND COMPONENTS REQUIRED
Components

Your frontend developer should create reusable:

cards
tables
status badges
upload modals
charts
notifications
progress bars
activity feeds
CHARTS REQUIRED

Use:

line charts
bar charts
pie charts
progress indicators
RESPONSIVE DESIGN

Must support:

desktop
tablet
mobile

Priority:
desktop first.

RECOMMENDED STACK
Frontend
React
TypeScript
TailwindCSS
shadcn/ui
Framer Motion
Recharts
UI STYLE

Target style:

modern SaaS
medical dashboard
enterprise AI platform