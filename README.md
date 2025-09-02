# 🐱 Cat Tracker

A comprehensive React TypeScript application for tracking your cat's health and daily activities. Built with Chakra UI for a clean, modern interface.

## ✨ Features

### 🚽 **Washroom Tracking**
- Log washroom visits with type (urine/feces/both)
- Track consistency for health monitoring
- Add notes for any observations
- View daily and weekly statistics

### 🍽️ **Food Tracking**
- Record meal times and portions
- Track different food types and brands
- Monitor daily calorie intake
- Specify units (grams, cups, pieces)

### 😴 **Sleep Tracking**
- Log sleep sessions with start/end times
- Track sleep quality (restful/normal/restless)
- Record sleep locations
- Calculate total daily sleep hours

### ⚖️ **Weight Tracking**
- Record weight measurements over time
- Visualize weight trends with interactive charts
- Track weight changes between measurements
- Monitor healthy weight ranges

### 📸 **Photo Gallery**
- Upload weekly progress photos
- Organize photos by week and year
- Add captions and notes to photos
- Visual timeline of your cat's growth

### 📊 **Additional Features**
- **Dashboard**: Overview of daily statistics and quick actions
- **Profile Management**: Store your cat's basic information
- **Data Export**: Export all data to JSON for backup
- **Dark Mode**: Toggle between light and dark themes
- **Local Storage**: All data saved locally in your browser
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cat_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## 📱 Usage

### First Time Setup
1. Launch the app and click "Set Up Cat Profile"
2. Enter your cat's name, breed, birth date, and current weight
3. Optionally upload a profile photo
4. Save the profile to start tracking

### Daily Tracking
1. **Dashboard**: View today's statistics and recent activities
2. **Quick Actions**: Use buttons to quickly log activities
3. **Navigation**: Use the sidebar (desktop) or menu (mobile) to access different tracking features

### Logging Activities
- Each tracking page has a form to log new entries
- All entries include timestamp and optional notes
- Recent entries are displayed below the form
- Delete unwanted entries with the trash icon

### Data Management
- **Export**: Navigate to Export page to download your data as JSON
- **Clear Data**: In Profile settings, you can clear all data (use with caution!)
- **Local Storage**: Data is automatically saved to your browser

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context for state management
├── pages/          # Page components for each route
├── types/          # TypeScript type definitions
├── theme/          # Chakra UI theme configuration
└── App.tsx         # Main application component
```

## 🎨 Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **date-fns** - Date utilities
- **React Hook Form** - Form management

## 📊 Data Privacy

All data is stored locally in your browser's localStorage. No data is sent to external servers. Your cat's information remains completely private on your device.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.