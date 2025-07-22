
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIncrementing, setIsIncrementing] = useState(false);

  // Load counter data on component mount
  const loadCounter = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleIncrement = async () => {
    try {
      setIsIncrementing(true);
      const result = await trpc.incrementCounter.mutate({ increment: 1 });
      setCounter(result);
    } catch (error) {
      console.error('Failed to increment counter:', error);
    } finally {
      setIsIncrementing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading counter...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Counter Application
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl font-bold text-blue-600">
            {counter?.value ?? 0}
          </div>
          <Button 
            onClick={handleIncrement}
            disabled={isIncrementing}
            size="lg"
            className="w-full text-lg py-6"
          >
            {isIncrementing ? 'Incrementing...' : 'Increment Counter'}
          </Button>
          {counter?.updated_at && (
            <p className="text-sm text-gray-500">
              Last updated: {counter.updated_at.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
