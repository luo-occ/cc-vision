import { Stack } from 'expo-router';
import { QueryProvider } from '../src/components/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Portfolio',
            headerStyle: {
              backgroundColor: '#3b82f6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="add-holding" 
          options={{ 
            title: 'Add Holding',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </QueryProvider>
  );
}