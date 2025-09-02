import { VStack, Heading, Text } from '@chakra-ui/react';
import { FaChartLine } from 'react-icons/fa';

const Analytics = () => {
  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">
        <FaChartLine style={{ display: 'inline', marginRight: '8px' }} />
        Analytics
      </Heading>
      <Text>Analytics coming soon...</Text>
    </VStack>
  );
};

export default Analytics;