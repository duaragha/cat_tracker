import { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  ButtonGroup,
  Divider,
  Select,
  SimpleGrid,
  Icon,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import {
  FaChartLine,
  FaToilet,
  FaUtensils,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBrain,
  FaFileDownload,
  FaPrint,
  FaShareAlt,
} from 'react-icons/fa';
import { useCatData } from '../contexts/CatDataContext';
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  isWithinInterval,
  differenceInDays,
  parseISO,
} from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  const { 
    catProfile, 
    washroomEntries, 
    foodEntries, 
    sleepEntries, 
    weightEntries 
  } = useCatData();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Calculate date ranges
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return { start: subDays(now, 1), end: now };
      case 'week':
        return { start: subWeeks(now, 1), end: now };
      case 'month':
        return { start: subMonths(now, 1), end: now };
      case 'year':
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subWeeks(now, 1), end: now };
    }
  };

  const dateRange = getDateRange();

  // Filter entries by date range
  const filteredWashroom = washroomEntries.filter(e => 
    isWithinInterval(e.timestamp, dateRange)
  );
  const filteredFood = foodEntries.filter(e => 
    isWithinInterval(e.timestamp, dateRange)
  );
  const filteredSleep = sleepEntries.filter(e => 
    isWithinInterval(e.startTime, dateRange)
  );
  const filteredWeight = weightEntries.filter(e => 
    isWithinInterval(e.measurementDate, dateRange)
  );

  // Health Trends Analytics
  const healthTrends = useMemo(() => {
    const dailyWashroom: Record<string, number> = {};
    const bloodOccurrences: any[] = [];
    const consistencyData: Record<string, number> = {};

    filteredWashroom.forEach(entry => {
      const date = format(entry.timestamp, 'yyyy-MM-dd');
      dailyWashroom[date] = (dailyWashroom[date] || 0) + 1;
      
      if (entry.hasBlood) {
        bloodOccurrences.push(entry);
      }
      
      if (entry.consistency) {
        consistencyData[entry.consistency] = (consistencyData[entry.consistency] || 0) + 1;
      }
    });

    const avgDaily = Object.values(dailyWashroom).reduce((a: number, b: number) => a + b, 0) / 
                    Math.max(Object.keys(dailyWashroom).length, 1);

    return {
      dailyAverage: avgDaily.toFixed(1),
      totalVisits: filteredWashroom.length,
      bloodCount: bloodOccurrences.length,
      consistencyBreakdown: consistencyData,
      trend: avgDaily > 5 ? 'high' : avgDaily < 2 ? 'low' : 'normal',
      chartData: Object.entries(dailyWashroom).map(([date, count]) => ({
        date: format(parseISO(date), 'MM/dd'),
        count,
      })).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }, [filteredWashroom]);

  // Food Analytics
  const foodAnalytics = useMemo(() => {
    let totalCalories = 0;
    let wetCount = 0;
    let dryCount = 0;
    const brandFrequency: Record<string, number> = {};
    const dailyIntake: Record<string, number> = {};

    filteredFood.forEach(entry => {
      const date = format(entry.timestamp, 'yyyy-MM-dd');
      const calories = entry.amount * (entry.foodCategory === 'Wet' ? 1.2 : 3.5);
      
      totalCalories += calories;
      dailyIntake[date] = (dailyIntake[date] || 0) + calories;
      
      if (entry.foodCategory === 'Wet') wetCount++;
      else dryCount++;
      
      if (entry.brand) {
        brandFrequency[entry.brand] = (brandFrequency[entry.brand] || 0) + 1;
      }
    });

    const avgDailyCalories = totalCalories / Math.max(Object.keys(dailyIntake).length, 1);

    return {
      avgDailyCalories: avgDailyCalories.toFixed(0),
      wetVsDryRatio: dryCount > 0 ? (wetCount / dryCount).toFixed(2) : 'N/A',
      topBrand: Object.entries(brandFrequency).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || 'N/A',
      totalMeals: filteredFood.length,
      chartData: Object.entries(dailyIntake).map(([date, calories]) => ({
        date: format(parseISO(date), 'MM/dd'),
        calories: Math.round(calories),
      })).sort((a, b) => a.date.localeCompare(b.date)),
      pieData: [
        { name: 'Wet Food', value: wetCount, color: '#4299E1' },
        { name: 'Dry Food', value: dryCount, color: '#F6AD55' },
      ],
    };
  }, [filteredFood]);

  // Sleep Analytics
  const sleepAnalytics = useMemo(() => {
    let totalSleepMinutes = 0;
    const locationFrequency: Record<string, number> = {};
    const qualityBreakdown = { restful: 0, normal: 0, restless: 0 };
    const dailySleep: Record<string, number> = {};

    filteredSleep.forEach(entry => {
      const date = format(entry.startTime, 'yyyy-MM-dd');
      totalSleepMinutes += entry.duration;
      dailySleep[date] = (dailySleep[date] || 0) + entry.duration;
      
      locationFrequency[entry.location] = (locationFrequency[entry.location] || 0) + 1;
      
      if (entry.quality) {
        qualityBreakdown[entry.quality]++;
      } else {
        qualityBreakdown.normal++;
      }
    });

    const avgDailySleep = totalSleepMinutes / Math.max(Object.keys(dailySleep).length, 1);
    const avgDailySleepHours = avgDailySleep / 60;

    return {
      avgDailySleepHours: avgDailySleepHours.toFixed(1),
      totalSleepHours: (totalSleepMinutes / 60).toFixed(1),
      favoriteLocation: Object.entries(locationFrequency).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || 'N/A',
      qualityScore: (qualityBreakdown.restful * 3 + qualityBreakdown.normal * 2 + qualityBreakdown.restless) / 
                    Math.max(filteredSleep.length * 3, 1) * 100,
      chartData: Object.entries(dailySleep).map(([date, minutes]) => ({
        date: format(parseISO(date), 'MM/dd'),
        hours: (minutes / 60).toFixed(1),
      })).sort((a, b) => a.date.localeCompare(b.date)),
      locationData: Object.entries(locationFrequency).map(([location, count]) => ({
        name: location,
        value: count,
      })),
    };
  }, [filteredSleep]);

  // Weight Analytics
  const weightAnalytics = useMemo(() => {
    if (filteredWeight.length === 0) return null;

    const sortedWeights = [...filteredWeight].sort((a, b) => 
      a.measurementDate.getTime() - b.measurementDate.getTime()
    );
    
    const latestWeight = sortedWeights[sortedWeights.length - 1].weight;
    const oldestWeight = sortedWeights[0].weight;
    const weightChange = latestWeight - oldestWeight;
    const percentChange = (weightChange / oldestWeight) * 100;

    // Convert kg to lbs for display
    const latestWeightLbs = latestWeight * 2.20462;
    
    // Calculate BMI (simplified for cats)
    const bmi = latestWeight / 0.3; // Simplified calculation

    return {
      currentWeight: latestWeightLbs.toFixed(1),
      weightChange: weightChange > 0 ? `+${(weightChange * 2.20462).toFixed(1)}` : (weightChange * 2.20462).toFixed(1),
      percentChange: percentChange.toFixed(1),
      bmi: bmi.toFixed(1),
      healthStatus: bmi < 18 ? 'Underweight' : bmi > 25 ? 'Overweight' : 'Healthy',
      chartData: sortedWeights.map(entry => ({
        date: format(entry.measurementDate, 'MM/dd'),
        weight: (entry.weight * 2.20462).toFixed(1),
      })),
    };
  }, [filteredWeight]);

  // Activity Insights
  const activityInsights = useMemo(() => {
    const hourlyActivity = new Array(24).fill(0);
    
    // Count activities by hour
    filteredWashroom.forEach(e => {
      const hour = e.timestamp.getHours();
      hourlyActivity[hour]++;
    });
    
    filteredFood.forEach(e => {
      const hour = e.timestamp.getHours();
      hourlyActivity[hour]++;
    });

    const mostActiveHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    const totalActivities = filteredWashroom.length + filteredFood.length + filteredSleep.length;
    
    // Calculate health score (0-100)
    let healthScore = 50; // Base score
    
    // Adjust based on washroom frequency
    if (parseFloat(healthTrends.dailyAverage) >= 2 && parseFloat(healthTrends.dailyAverage) <= 5) healthScore += 15;
    else healthScore -= 10;
    
    // Adjust based on blood occurrences
    if (healthTrends.bloodCount === 0) healthScore += 15;
    else healthScore -= healthTrends.bloodCount * 5;
    
    // Adjust based on sleep quality
    if (sleepAnalytics.qualityScore > 70) healthScore += 10;
    else if (sleepAnalytics.qualityScore < 50) healthScore -= 10;
    
    // Adjust based on eating habits
    if (parseFloat(foodAnalytics.avgDailyCalories) >= 200 && parseFloat(foodAnalytics.avgDailyCalories) <= 400) healthScore += 10;
    
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      healthScore,
      mostActiveTime: `${mostActiveHour}:00 - ${mostActiveHour + 1}:00`,
      totalActivities,
      activityLevel: totalActivities > 20 ? 'High' : totalActivities > 10 ? 'Moderate' : 'Low',
      hourlyData: hourlyActivity.map((count, hour) => ({
        hour: `${hour}:00`,
        activities: count,
      })),
    };
  }, [filteredWashroom, filteredFood, filteredSleep, healthTrends, sleepAnalytics, foodAnalytics]);

  // Predictive Features
  const predictions = useMemo(() => {
    // Simple prediction based on patterns
    const washroomTimes = filteredWashroom.map(e => e.timestamp.getHours());
    const foodTimes = filteredFood.map(e => e.timestamp.getHours());
    
    const avgWashroomTime = washroomTimes.reduce((a, b) => a + b, 0) / Math.max(washroomTimes.length, 1);
    const avgFoodTime = foodTimes.reduce((a, b) => a + b, 0) / Math.max(foodTimes.length, 1);
    
    const now = new Date();
    const currentHour = now.getHours();
    
    let nextWashroomHour = Math.round(avgWashroomTime);
    if (nextWashroomHour <= currentHour) nextWashroomHour += 24;
    
    let nextFoodHour = Math.round(avgFoodTime);
    if (nextFoodHour <= currentHour) nextFoodHour += 6; // Assume ~6 hours between meals
    
    // Health risk indicators
    const risks = [];
    if (healthTrends.bloodCount > 0) risks.push('Blood in stool detected');
    if (parseFloat(healthTrends.dailyAverage) > 6) risks.push('Frequent washroom visits');
    if (parseFloat(healthTrends.dailyAverage) < 1) risks.push('Infrequent washroom visits');
    if (parseFloat(sleepAnalytics.avgDailySleepHours) < 10) risks.push('Below average sleep');
    if (parseFloat(foodAnalytics.avgDailyCalories) < 150) risks.push('Low calorie intake');
    
    return {
      nextWashroomTime: `${nextWashroomHour % 24}:00`,
      nextFeedingTime: `${nextFoodHour % 24}:00`,
      healthRisks: risks,
      riskLevel: risks.length === 0 ? 'low' : risks.length <= 2 ? 'medium' : 'high',
    };
  }, [filteredWashroom, filteredFood, healthTrends, sleepAnalytics, foodAnalytics]);

  // Comparative Analytics
  const comparativeAnalytics = useMemo(() => {
    const previousRange = {
      start: subDays(dateRange.start, differenceInDays(dateRange.end, dateRange.start)),
      end: dateRange.start,
    };

    const prevWashroom = washroomEntries.filter(e => 
      isWithinInterval(e.timestamp, previousRange)
    );
    const prevFood = foodEntries.filter(e => 
      isWithinInterval(e.timestamp, previousRange)
    );
    const prevSleep = sleepEntries.filter(e => 
      isWithinInterval(e.startTime, previousRange)
    );

    const comparisons = {
      washroom: {
        current: filteredWashroom.length,
        previous: prevWashroom.length,
        change: ((filteredWashroom.length - prevWashroom.length) / Math.max(prevWashroom.length, 1) * 100).toFixed(1),
      },
      food: {
        current: filteredFood.length,
        previous: prevFood.length,
        change: ((filteredFood.length - prevFood.length) / Math.max(prevFood.length, 1) * 100).toFixed(1),
      },
      sleep: {
        current: filteredSleep.length,
        previous: prevSleep.length,
        change: ((filteredSleep.length - prevSleep.length) / Math.max(prevSleep.length, 1) * 100).toFixed(1),
      },
    };

    return comparisons;
  }, [dateRange, washroomEntries, foodEntries, sleepEntries, filteredWashroom, filteredFood, filteredSleep]);

  // Generate Report Summary
  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      period: timeRange,
      catName: catProfile?.name || 'Unknown',
      summary: {
        healthScore: activityInsights.healthScore,
        washroomVisits: healthTrends.totalVisits,
        meals: foodAnalytics.totalMeals,
        sleepHours: sleepAnalytics.totalSleepHours,
        currentWeight: weightAnalytics?.currentWeight || 'N/A',
      },
      alerts: predictions.healthRisks,
      recommendations: [] as string[],
    };

    // Add recommendations based on data
    if (healthTrends.bloodCount > 0) {
      report.recommendations.push('Schedule vet visit for blood in stool');
    }
    if (parseFloat(healthTrends.dailyAverage) > 6) {
      report.recommendations.push('Monitor for potential digestive issues');
    }
    if (parseFloat(sleepAnalytics.avgDailySleepHours) < 10) {
      report.recommendations.push('Ensure quiet sleeping environment');
    }
    if (parseFloat(foodAnalytics.avgDailyCalories) < 200) {
      report.recommendations.push('Consider increasing food portions');
    }

    return report;
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap">
        <Heading size="lg">
          <Icon as={FaChartLine} mr={2} />
          Analytics Dashboard
        </Heading>
        <HStack spacing={4}>
          <Select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            maxW="150px"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </Select>
          <ButtonGroup size="sm">
            <Tooltip label="Download Report">
              <Button leftIcon={<FaFileDownload />} colorScheme="blue">
                Export
              </Button>
            </Tooltip>
            <Tooltip label="Share Report">
              <Button leftIcon={<FaShareAlt />} variant="outline">
                Share
              </Button>
            </Tooltip>
          </ButtonGroup>
        </HStack>
      </HStack>

      {/* Health Score Overview */}
      <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" width="full">
              <VStack align="start">
                <Text fontSize="sm" color="gray.500">Overall Health Score</Text>
                <HStack>
                  <Text fontSize="4xl" fontWeight="bold">
                    {activityInsights.healthScore}
                  </Text>
                  <Text fontSize="xl" color="gray.500">/100</Text>
                </HStack>
              </VStack>
              <Box position="relative" width="120px" height="120px">
                <Progress
                  value={activityInsights.healthScore}
                  size="lg"
                  colorScheme={
                    activityInsights.healthScore >= 70 ? 'green' :
                    activityInsights.healthScore >= 50 ? 'yellow' : 'red'
                  }
                  borderRadius="full"
                />
              </Box>
            </HStack>
            
            {/* Health Alerts */}
            {predictions.healthRisks.length > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Health Alerts</AlertTitle>
                  <AlertDescription>
                    {predictions.healthRisks.map((risk, idx) => (
                      <Text key={idx}>• {risk}</Text>
                    ))}
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs colorScheme="blue">
        <TabList overflowX="auto" overflowY="hidden">
          <Tab>Health Trends</Tab>
          <Tab>Food</Tab>
          <Tab>Sleep</Tab>
          <Tab>Weight</Tab>
          <Tab>Activity</Tab>
          <Tab>Predictions</Tab>
          <Tab>Comparison</Tab>
          <Tab>Reports</Tab>
        </TabList>

        <TabPanels>
          {/* Health Trends Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Daily Average</StatLabel>
                  <StatNumber>{healthTrends.dailyAverage}</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={
                      healthTrends.trend === 'normal' ? 'green' :
                      healthTrends.trend === 'high' ? 'orange' : 'yellow'
                    }>
                      {healthTrends.trend}
                    </Badge>
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Total Visits</StatLabel>
                  <StatNumber>{healthTrends.totalVisits}</StatNumber>
                  <StatHelpText>in {timeRange}</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Blood Occurrences</StatLabel>
                  <StatNumber color={healthTrends.bloodCount > 0 ? 'red.500' : 'green.500'}>
                    {healthTrends.bloodCount}
                  </StatNumber>
                  <StatHelpText>
                    {healthTrends.bloodCount > 0 ? 'Needs attention' : 'All clear'}
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Most Common</StatLabel>
                  <StatNumber fontSize="lg">
                    {Object.entries(healthTrends.consistencyBreakdown)[0]?.[0] || 'N/A'}
                  </StatNumber>
                  <StatHelpText>consistency type</StatHelpText>
                </Stat>
              </SimpleGrid>

              {/* Washroom Frequency Chart */}
              <Card>
                <CardHeader>
                  <Heading size="md">Washroom Frequency Trend</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={healthTrends.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#4299E1" 
                        name="Visits"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* Consistency Breakdown */}
              <Card>
                <CardHeader>
                  <Heading size="md">Consistency Distribution</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(healthTrends.consistencyBreakdown).map(([key, value]) => ({
                          name: key,
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(healthTrends.consistencyBreakdown).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#4299E1', '#48BB78', '#F6AD55', '#FC8181'][index]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Food Analytics Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Avg Daily Calories</StatLabel>
                  <StatNumber>{foodAnalytics.avgDailyCalories}</StatNumber>
                  <StatHelpText>kcal/day</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Wet/Dry Ratio</StatLabel>
                  <StatNumber>{foodAnalytics.wetVsDryRatio}</StatNumber>
                  <StatHelpText>optimal: 1.0-2.0</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Favorite Brand</StatLabel>
                  <StatNumber fontSize="lg">{foodAnalytics.topBrand}</StatNumber>
                  <StatHelpText>most frequent</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Total Meals</StatLabel>
                  <StatNumber>{foodAnalytics.totalMeals}</StatNumber>
                  <StatHelpText>in {timeRange}</StatHelpText>
                </Stat>
              </SimpleGrid>

              {/* Calorie Intake Chart */}
              <Card>
                <CardHeader>
                  <Heading size="md">Daily Calorie Intake</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={foodAnalytics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#48BB78" 
                        fill="#48BB78"
                        fillOpacity={0.6}
                        name="Calories (kcal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* Food Type Distribution */}
              <Card>
                <CardHeader>
                  <Heading size="md">Food Type Distribution</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={foodAnalytics.pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {foodAnalytics.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Sleep Analytics Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Avg Daily Sleep</StatLabel>
                  <StatNumber>{sleepAnalytics.avgDailySleepHours}</StatNumber>
                  <StatHelpText>hours/day</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Sleep Quality</StatLabel>
                  <StatNumber>{sleepAnalytics.qualityScore.toFixed(0)}%</StatNumber>
                  <StatHelpText>
                    <Progress value={sleepAnalytics.qualityScore} size="sm" colorScheme="purple" />
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Favorite Spot</StatLabel>
                  <StatNumber fontSize="lg">{sleepAnalytics.favoriteLocation}</StatNumber>
                  <StatHelpText>most used</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Total Sleep</StatLabel>
                  <StatNumber>{sleepAnalytics.totalSleepHours}</StatNumber>
                  <StatHelpText>hours in {timeRange}</StatHelpText>
                </Stat>
              </SimpleGrid>

              {/* Sleep Pattern Chart */}
              <Card>
                <CardHeader>
                  <Heading size="md">Sleep Pattern</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sleepAnalytics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="hours" fill="#9F7AEA" name="Sleep (hours)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* Sleep Location Distribution */}
              <Card>
                <CardHeader>
                  <Heading size="md">Sleep Locations</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sleepAnalytics.locationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sleepAnalytics.locationData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#9F7AEA', '#B794F4', '#D6BCFA', '#E9D8FD'][index % 4]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Weight Management Tab */}
          <TabPanel>
            {weightAnalytics ? (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  <Stat>
                    <StatLabel>Current Weight</StatLabel>
                    <StatNumber>{weightAnalytics.currentWeight} lbs</StatNumber>
                    <StatHelpText>
                      <StatArrow type={parseFloat(weightAnalytics.weightChange) >= 0 ? 'increase' : 'decrease'} />
                      {weightAnalytics.weightChange} lbs
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Change</StatLabel>
                    <StatNumber>{weightAnalytics.percentChange}%</StatNumber>
                    <StatHelpText>from start of period</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>BMI</StatLabel>
                    <StatNumber>{weightAnalytics.bmi}</StatNumber>
                    <StatHelpText>
                      <Badge colorScheme={
                        weightAnalytics.healthStatus === 'Healthy' ? 'green' :
                        weightAnalytics.healthStatus === 'Underweight' ? 'yellow' : 'orange'
                      }>
                        {weightAnalytics.healthStatus}
                      </Badge>
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Measurements</StatLabel>
                    <StatNumber>{filteredWeight.length}</StatNumber>
                    <StatHelpText>in {timeRange}</StatHelpText>
                  </Stat>
                </SimpleGrid>

                {/* Weight Trend Chart */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Weight Trend</Heading>
                  </CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weightAnalytics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#F6AD55" 
                          name="Weight (lbs)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </VStack>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>No weight data available for the selected period.</AlertDescription>
              </Alert>
            )}
          </TabPanel>

          {/* Activity Insights Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Activity Level</StatLabel>
                  <StatNumber>{activityInsights.activityLevel}</StatNumber>
                  <StatHelpText>{activityInsights.totalActivities} activities</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Most Active Time</StatLabel>
                  <StatNumber fontSize="lg">{activityInsights.mostActiveTime}</StatNumber>
                  <StatHelpText>peak activity</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Health Score</StatLabel>
                  <StatNumber>{activityInsights.healthScore}/100</StatNumber>
                  <StatHelpText>
                    <Progress 
                      value={activityInsights.healthScore} 
                      size="sm" 
                      colorScheme={
                        activityInsights.healthScore >= 70 ? 'green' :
                        activityInsights.healthScore >= 50 ? 'yellow' : 'red'
                      }
                    />
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Daily Pattern</StatLabel>
                  <StatNumber fontSize="lg">
                    {activityInsights.totalActivities > 15 ? 'Active' : 'Calm'}
                  </StatNumber>
                  <StatHelpText>behavior type</StatHelpText>
                </Stat>
              </SimpleGrid>

              {/* Hourly Activity Chart */}
              <Card>
                <CardHeader>
                  <Heading size="md">24-Hour Activity Pattern</Heading>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityInsights.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="activities" fill="#FC8181" name="Activities" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* Health Score Breakdown */}
              <Card>
                <CardHeader>
                  <Heading size="md">Health Score Factors</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text>Washroom Frequency</Text>
                      <Badge colorScheme={healthTrends.trend === 'normal' ? 'green' : 'yellow'}>
                        {healthTrends.trend}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Blood Occurrences</Text>
                      <Badge colorScheme={healthTrends.bloodCount === 0 ? 'green' : 'red'}>
                        {healthTrends.bloodCount === 0 ? 'None' : `${healthTrends.bloodCount} times`}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Sleep Quality</Text>
                      <Badge colorScheme={sleepAnalytics.qualityScore > 70 ? 'green' : 'yellow'}>
                        {sleepAnalytics.qualityScore.toFixed(0)}%
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Calorie Intake</Text>
                      <Badge colorScheme={
                        parseFloat(foodAnalytics.avgDailyCalories) >= 200 && 
                        parseFloat(foodAnalytics.avgDailyCalories) <= 400 ? 'green' : 'yellow'
                      }>
                        {foodAnalytics.avgDailyCalories} kcal
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Predictive Features Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Card>
                  <CardHeader>
                    <Heading size="md">
                      <Icon as={FaClock} mr={2} />
                      Predicted Schedule
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FaToilet} color="blue.500" />
                          <Text>Next Washroom Visit</Text>
                        </HStack>
                        <Badge colorScheme="blue" fontSize="md">
                          {predictions.nextWashroomTime}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FaUtensils} color="green.500" />
                          <Text>Next Feeding Time</Text>
                        </HStack>
                        <Badge colorScheme="green" fontSize="md">
                          {predictions.nextFeedingTime}
                        </Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">
                      <Icon as={FaExclamationTriangle} mr={2} />
                      Risk Assessment
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text>Risk Level</Text>
                        <Badge 
                          colorScheme={
                            predictions.riskLevel === 'low' ? 'green' :
                            predictions.riskLevel === 'medium' ? 'yellow' : 'red'
                          }
                          fontSize="md"
                        >
                          {predictions.riskLevel.toUpperCase()}
                        </Badge>
                      </HStack>
                      {predictions.healthRisks.length > 0 ? (
                        predictions.healthRisks.map((risk, idx) => (
                          <Alert key={idx} status="warning" size="sm">
                            <AlertIcon />
                            <Text fontSize="sm">{risk}</Text>
                          </Alert>
                        ))
                      ) : (
                        <Alert status="success">
                          <AlertIcon />
                          <Text>No immediate health concerns detected</Text>
                        </Alert>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <Heading size="md">
                    <Icon as={FaBrain} mr={2} />
                    AI-Powered Recommendations
                  </Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {generateReport().recommendations.length > 0 ? (
                      generateReport().recommendations.map((rec, idx) => (
                        <Alert key={idx} status="info">
                          <AlertIcon />
                          <AlertDescription>{rec}</AlertDescription>
                        </Alert>
                      ))
                    ) : (
                      <Alert status="success">
                        <AlertIcon />
                        <AlertDescription>
                          Your cat's health metrics look good! Keep up the current care routine.
                        </AlertDescription>
                      </Alert>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Comparative Analytics Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Period Comparison</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Current {timeRange} vs Previous {timeRange}
                  </Text>
                </CardHeader>
                <CardBody>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Metric</Th>
                          <Th isNumeric>Current</Th>
                          <Th isNumeric>Previous</Th>
                          <Th isNumeric>Change</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Washroom Visits</Td>
                          <Td isNumeric>{comparativeAnalytics.washroom.current}</Td>
                          <Td isNumeric>{comparativeAnalytics.washroom.previous}</Td>
                          <Td isNumeric>
                            <HStack justify="flex-end">
                              <StatArrow 
                                type={parseFloat(comparativeAnalytics.washroom.change) >= 0 ? 'increase' : 'decrease'} 
                              />
                              <Text>{Math.abs(parseFloat(comparativeAnalytics.washroom.change))}%</Text>
                            </HStack>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>Meals</Td>
                          <Td isNumeric>{comparativeAnalytics.food.current}</Td>
                          <Td isNumeric>{comparativeAnalytics.food.previous}</Td>
                          <Td isNumeric>
                            <HStack justify="flex-end">
                              <StatArrow 
                                type={parseFloat(comparativeAnalytics.food.change) >= 0 ? 'increase' : 'decrease'} 
                              />
                              <Text>{Math.abs(parseFloat(comparativeAnalytics.food.change))}%</Text>
                            </HStack>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>Sleep Sessions</Td>
                          <Td isNumeric>{comparativeAnalytics.sleep.current}</Td>
                          <Td isNumeric>{comparativeAnalytics.sleep.previous}</Td>
                          <Td isNumeric>
                            <HStack justify="flex-end">
                              <StatArrow 
                                type={parseFloat(comparativeAnalytics.sleep.change) >= 0 ? 'increase' : 'decrease'} 
                              />
                              <Text>{Math.abs(parseFloat(comparativeAnalytics.sleep.change))}%</Text>
                            </HStack>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>

              {/* Trend Analysis */}
              <Card>
                <CardHeader>
                  <Heading size="md">Trend Analysis</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text>Overall Health Trend</Text>
                      <Badge 
                        colorScheme={
                          activityInsights.healthScore >= 70 ? 'green' :
                          activityInsights.healthScore >= 50 ? 'yellow' : 'red'
                        }
                      >
                        {activityInsights.healthScore >= 70 ? 'Improving' :
                         activityInsights.healthScore >= 50 ? 'Stable' : 'Declining'}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Activity Pattern</Text>
                      <Badge colorScheme="blue">
                        {activityInsights.activityLevel}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Weight Trend</Text>
                      <Badge colorScheme={
                        weightAnalytics && parseFloat(weightAnalytics.percentChange) > 5 ? 'orange' :
                        weightAnalytics && parseFloat(weightAnalytics.percentChange) < -5 ? 'yellow' : 'green'
                      }>
                        {weightAnalytics ? 
                          (parseFloat(weightAnalytics.percentChange) > 0 ? 'Gaining' : 'Losing') :
                          'No Data'
                        }
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Reports Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Health Report Summary</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Generated on {format(new Date(), 'PPP')}
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Report Header */}
                    <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Text fontWeight="bold">Cat Name:</Text>
                          <Text>{catProfile?.name || 'Unknown'}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="bold">Report Period:</Text>
                          <Text>Last {timeRange}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="bold">Overall Health Score:</Text>
                          <Badge 
                            colorScheme={
                              activityInsights.healthScore >= 70 ? 'green' :
                              activityInsights.healthScore >= 50 ? 'yellow' : 'red'
                            }
                            fontSize="md"
                          >
                            {activityInsights.healthScore}/100
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Key Metrics */}
                    <Box>
                      <Heading size="sm" mb={3}>Key Metrics</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <HStack justify="space-between">
                          <Text>Washroom Visits:</Text>
                          <Text fontWeight="bold">{healthTrends.totalVisits}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Total Meals:</Text>
                          <Text fontWeight="bold">{foodAnalytics.totalMeals}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Average Sleep:</Text>
                          <Text fontWeight="bold">{sleepAnalytics.avgDailySleepHours} hrs/day</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Current Weight:</Text>
                          <Text fontWeight="bold">{weightAnalytics?.currentWeight || 'N/A'} lbs</Text>
                        </HStack>
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Health Alerts */}
                    <Box>
                      <Heading size="sm" mb={3}>Health Alerts</Heading>
                      {predictions.healthRisks.length > 0 ? (
                        <VStack spacing={2} align="stretch">
                          {predictions.healthRisks.map((risk, idx) => (
                            <Alert key={idx} status="warning" size="sm">
                              <AlertIcon />
                              <Text fontSize="sm">{risk}</Text>
                            </Alert>
                          ))}
                        </VStack>
                      ) : (
                        <Alert status="success">
                          <AlertIcon />
                          <Text>No health concerns detected</Text>
                        </Alert>
                      )}
                    </Box>

                    {/* Recommendations */}
                    <Box>
                      <Heading size="sm" mb={3}>Recommendations</Heading>
                      <VStack spacing={2} align="stretch">
                        {generateReport().recommendations.length > 0 ? (
                          generateReport().recommendations.map((rec, idx) => (
                            <HStack key={idx} align="start">
                              <Icon as={FaCheckCircle} color="blue.500" mt={1} />
                              <Text fontSize="sm">{rec}</Text>
                            </HStack>
                          ))
                        ) : (
                          <Text fontSize="sm" color="gray.500">
                            No specific recommendations at this time. Continue regular monitoring.
                          </Text>
                        )}
                      </VStack>
                    </Box>

                    {/* Action Buttons */}
                    <HStack spacing={3} pt={4}>
                      <Button 
                        leftIcon={<FaFileDownload />} 
                        colorScheme="blue"
                        onClick={() => {
                          const report = generateReport();
                          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `cat-health-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
                          a.click();
                        }}
                      >
                        Download Report
                      </Button>
                      <Button 
                        leftIcon={<FaPrint />} 
                        variant="outline"
                        onClick={() => window.print()}
                      >
                        Print Report
                      </Button>
                      <Button 
                        leftIcon={<FaShareAlt />} 
                        variant="outline"
                      >
                        Share with Vet
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default Analytics;