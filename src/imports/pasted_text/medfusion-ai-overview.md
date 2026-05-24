MEDFUSION AI — SYSTEM OVERVIEW

MedFusion AI is a:

Federated Medical AI Platform

The Admin Platform controls:

hospitals
doctors
AI teams
federated learning rounds
uploaded models
subscriptions
deployments
analytics

The platform supports 4 modalities:

Modality	Example
Chest X-Ray	Pneumonia
Brain MRI	Tumor Detection
Retinal OCT	Retinal Diseases
Skin Lesion	HAM10000

Each modality can have:

different architectures
different backbones
different versions

Example:

Modality	Architecture
MRI	EfficientNetV2
Chest X-Ray	ResNet18
OCT	ViT
Skin	ConvNeXt
GLOBAL LAYOUT
SIDEBAR
Dashboard
Hospitals
Users & Permissions
Federated Models
Model Assignments
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
search bar
notification bell
admin avatar
dark/light toggle
1. DASHBOARD PAGE
URL
/admin/dashboard
PURPOSE

Global overview of system.

COMPONENTS
A. TOP STATISTICS CARDS

4 large cards.

Card 1
Total Hospitals
18

Clickable → opens hospitals page.

Card 2
Active Federated Models
12

Clickable → opens models page.

Card 3
Running FL Rounds
5

Clickable → opens FL rounds page.

Card 4
Premium Subscribers
9

Clickable → opens subscriptions page.

B. RECENT ACTIVITY FEED

Scrollable activity panel.

Example Activities
CHU Alger uploaded MRI update.
Round 15 aggregation completed.
MRI-EFF-v1.4 deployed.
Clinic B subscription expired.
C. ACTIVE MODELS TABLE
Model ID	Modality	Version	Round	Status
MRI-EFF-v1.4	MRI	v1.4	15	Running
D. QUICK ACTION BUTTONS

Buttons:

Upload Model
Start FL Round
Assign Hospitals
Manage Plans
E. ALERT BOXES

Top-right popup notifications.

Examples
Success Alert
Model uploaded successfully.

Green.

Error Alert
Aggregation failed.

Red.

Warning Alert
Subscription expires in 3 days.

Orange.

2. HOSPITALS PAGE
URL
/admin/hospitals
PURPOSE

Manage all hospitals.

COMPONENTS
A. HOSPITALS TABLE

Columns:

Column
Hospital Name
Country
Plan
Doctors
AI Teams
Participation
Status
Actions
ACTION BUTTONS

Each row contains:

View
Edit
Suspend
Delete
Assign Models
B. VIEW HOSPITAL PAGE
URL
/admin/hospitals/view/:id
SECTIONS
GENERAL INFO CARD
Field	Example
Name	CHU Alger
Country	Algeria
Created At	Jan 2026
Plan	Premium
TEAM MEMBERS SECTION
Doctors Table
Name	Specialty	Status
Dr. Ahmed	Radiology	Active
AI Team Table
Name	Role	Status
Fatima	ML Engineer	Active
ASSIGNED MODELS SECTION

Model cards.

Example:

Brain MRI
EfficientNetV2
v1.4
PARTICIPATION ANALYTICS

Charts:

rounds joined
upload success rate
average local accuracy
HOSPITAL ACTIONS

Buttons:

Suspend Hospital
Upgrade Plan
Reset Password
Delete Hospital
C. EDIT HOSPITAL PAGE
Fields
Field
Hospital Name
Country
Contact Email
Plan
Status
BUTTONS
Save Changes
Cancel
MODALS
DELETE CONFIRMATION MODAL
Are you sure you want to delete this hospital?

Buttons:

Delete
Cancel
SUSPEND MODAL
Suspending hospital will block all users.
Continue?
3. USERS & PERMISSIONS PAGE
URL
/admin/users
PURPOSE

Manage:

doctors
AI teams
permissions
USERS TABLE
Name	Hospital	Role	Status	Actions
Ahmed	CHU Alger	Doctor	Active	View
ROLES
Role
Doctor
AI Team
Admin
VIEW USER PAGE
DOCTOR VIEW

Shows:

specialization
diagnosis count
assigned modalities
AI TEAM VIEW

Shows:

participated rounds
uploaded weights
local accuracies
PERMISSIONS SECTION

Checkbox permissions.

DOCTOR PERMISSIONS
Permission
View Clinical Models
Use Diagnosis
Export Reports
View Case History
AI TEAM PERMISSIONS
Permission
Download Global Models
Upload Local Updates
View Logs
View FL Metrics
ADMIN PERMISSIONS
Permission
Upload Models
Aggregate
Deploy
Manage Plans
GRANT PERMISSION WORKFLOW

Admin opens user page.

Clicks:

Manage Permissions

Modal opens.

Checkboxes appear.

Admin checks/unchecks.

Clicks:

Save Permissions

Success alert appears.

4. FEDERATED MODELS PAGE
URL
/admin/models
PURPOSE

Upload and manage models.

A. UPLOAD MODEL SECTION

Large drag-and-drop upload box.

Upload Flow
Step 1

Admin uploads:

model_package.zip
Step 2

Loading spinner appears.

Step 3

Backend extracts metadata.

Step 4

Preview modal appears.

PREVIEW MODAL

Shows:

Field	Example
Modality	Brain MRI
Architecture	EfficientNetV2
Version	v1.4
Explainability	Grad-CAM
BUTTONS
Approve
Cancel
MODEL TABLE
Model ID	Modality	Backbone	Version	Status
MODEL ACTIONS
View
Assign
Deploy
Delete
VIEW MODEL PAGE
SECTIONS
Model Information
Participating Hospitals
Training History
Accuracy Evolution Chart
Explainability Samples
Logs Viewer
LOGS VIEWER

Terminal-style dark box.

Example:

Round 15 started...
Receiving updates...
Aggregation completed.
WEIGHTS VIEWER

Visual stats only.

DO NOT show raw tensors.

Show:

file size
upload date
architecture compatibility
5. MODEL ASSIGNMENT PAGE
PURPOSE

Send models to:

doctors
AI teams
IMPORTANT WORKFLOW

Because you have:

4 modalities
multiple architectures

Doctors/AI teams select models visually.

ASSIGNMENT PAGE LAYOUT
A. SELECT MODEL SECTION

Cards for each model.

Example:

Brain MRI
EfficientNetV2
v1.4
B. SELECT TARGET USERS

Tabs:

Doctors
AI Teams
Hospitals
C. ASSIGNMENT METHOD
For Doctors

Doctor receives:

diagnosis access
approved clinical model
For AI Team

AI team receives:

training package
notebook
weights
logs access
D. PACKAGE VISUALIZATION

Visual flow:

Global Model
↓
Generate Client Package
↓
Hospital AI Team
↓
Local Training
↓
Upload Local Update
E. DOWNLOAD VISUALIZATION

AI team sees:

Download Package

Package contains:

weights.pth
notebook.ipynb
config.json
F. MODEL CHOOSER FOR DOCTORS

Doctor sees cards:

Modality	Architecture	Accuracy
MRI	EfficientNetV2	96.8%

Doctor selects one.

6. FL ROUNDS PAGE
URL
/admin/fl-rounds
PURPOSE

Monitor federated communication rounds.

ROUND TABLE
Round	Model	Hospitals	Status
VIEW ROUND PAGE
COMPONENTS
Round Timeline
Start
↓
Training
↓
Uploads
↓
Aggregation
↓
Deployment
Upload Progress Bars

Per hospital.

Accuracy Charts

Show:

local accuracies
global accuracy
Upload Status
Status	Color
Uploaded	Green
Pending	Orange
Failed	Red
7. AGGREGATION ENGINE PAGE
PURPOSE

Visualize adaptive aggregation.

COMPONENTS
Contribution Scores Table
Hospital	Weight
Charts
SSL divergence
local accuracies
contribution distribution
Aggregation Logs

Live logs viewer.

8. SUBSCRIPTIONS PAGE
URL
/admin/subscriptions
PLANS CARDS
FREE
5 diagnoses/month
Limited models
STANDARD
100 diagnoses/month
Explainability enabled
PREMIUM
Unlimited usage
Full FL participation
HOSPITAL SUBSCRIPTIONS TABLE
Hospital	Plan	Usage	Status
ACTIONS
Upgrade
Suspend
Renew
UPGRADE MODAL

Admin selects:

plan
duration

Clicks:

Confirm Upgrade
SUSPEND MODAL
Suspending subscription will disable access.
Continue?
9. NOTIFICATIONS PAGE
TYPES
Type
Upload
Aggregation
Subscription
Security
NOTIFICATION CARD
Field
Icon
Title
Description
Time
Status
EXAMPLES
MRI model uploaded successfully.
Hospital_03 failed validation.
10. PROFILE PAGE
URL
/admin/profile
SECTIONS
Personal Information
name
email
role
Security
change password
enable 2FA
Preferences
theme
notifications
11. SETTINGS PAGE
FL SETTINGS
Setting
Default rounds
Aggregation timeout
EMAIL SETTINGS

SMTP configs.

SECURITY SETTINGS
session timeout
password rules
GLOBAL ALERTS SYSTEM
SUCCESS ALERT

Green.

Appears:

after save
upload
deploy
ERROR ALERT

Red.

Appears:

upload failed
aggregation failed
WARNING ALERT

Orange.

Appears:

subscription expiring
missing uploads
DELETE ALERT

Confirmation modal before deletion.

FINAL IMPORTANT NOTE FOR DEVELOPER

The platform must feel like:

“Enterprise Medical AI System”

NOT:

student dashboard
simple CRUD app

The UI must emphasize:

AI workflows
federated learning
medical professionalism
model management
analytics
collaboration between hospitals.