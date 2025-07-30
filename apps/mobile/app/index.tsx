import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { usePortfolio, useRefreshPrices, useDeleteHolding, useUpdateHolding } from '../src/hooks/usePortfolio';
import { formatCurrency, formatPercent, formatNumber, getChangeColor } from '../src/utils/format';
import { Holding, UpdateHoldingRequest } from '@portfolio/shared';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  
  const { data: portfolio, isLoading, error, refetch } = usePortfolio();
  const refreshPrices = useRefreshPrices();
  const deleteHolding = useDeleteHolding();
  const updateHolding = useUpdateHolding();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleRefreshPrices = async () => {
    try {
      await refreshPrices.mutateAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh prices');
    }
  };

  const handleDeleteHolding = (holding: Holding) => {
    Alert.alert(
      'Delete Holding',
      `Are you sure you want to delete ${holding.symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHolding.mutateAsync(holding.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete holding');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading portfolio</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!portfolio) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No portfolio data available</Text>
      </View>
    );
  }

  const isPositive = portfolio.totalGainLoss >= 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        {/* Portfolio Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(portfolio.totalValue)}
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Cost</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(portfolio.totalCost)}
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Gain/Loss</Text>
              <Text style={[styles.summaryValue, { color: getChangeColor(portfolio.totalGainLoss) }]}>
                {portfolio.totalGainLoss >= 0 ? '+' : ''}
                {formatCurrency(portfolio.totalGainLoss)}
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Return</Text>
              <Text style={[styles.summaryValue, { color: getChangeColor(portfolio.totalGainLoss) }]}>
                {portfolio.totalGainLoss >= 0 ? '+' : ''}
                {formatPercent(portfolio.totalGainLossPercent)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshPrices}
            disabled={refreshPrices.isPending}
          >
            <Ionicons 
              name="refresh" 
              size={16} 
              color="#374151" 
              style={refreshPrices.isPending ? { transform: [{ rotate: '180deg' }] } : {}}
            />
            <Text style={styles.refreshButtonText}>
              {refreshPrices.isPending ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-holding')}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.addButtonText}>Add Holding</Text>
          </TouchableOpacity>
        </View>

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          <Text style={styles.holdingsTitle}>Holdings</Text>
          
          {portfolio.holdings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No holdings yet. Add your first investment!
              </Text>
            </View>
          ) : (
            portfolio.holdings.map((holding) => {
              const currentValue = holding.currentPrice 
                ? holding.quantity * holding.currentPrice 
                : holding.quantity * holding.costBasis;
              const costValue = holding.quantity * holding.costBasis;
              const gainLoss = currentValue - costValue;
              const gainLossPercent = costValue > 0 ? (gainLoss / costValue) * 100 : 0;

              return (
                <View key={holding.id} style={styles.holdingCard}>
                  <View style={styles.holdingHeader}>
                    <View style={styles.holdingInfo}>
                      <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
                      <Text style={styles.holdingName}>{holding.name}</Text>
                    </View>
                    <View style={styles.holdingActions}>
                      <TouchableOpacity
                        onPress={() => setEditingHolding(holding)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="pencil" size={16} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteHolding(holding)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.holdingDetails}>
                    <View style={styles.holdingRow}>
                      <Text style={styles.holdingLabel}>Quantity:</Text>
                      <Text style={styles.holdingText}>{formatNumber(holding.quantity)}</Text>
                    </View>
                    
                    <View style={styles.holdingRow}>
                      <Text style={styles.holdingLabel}>Avg Cost:</Text>
                      <Text style={styles.holdingText}>{formatCurrency(holding.costBasis)}</Text>
                    </View>
                    
                    <View style={styles.holdingRow}>
                      <Text style={styles.holdingLabel}>Current:</Text>
                      <Text style={styles.holdingText}>
                        {holding.currentPrice ? formatCurrency(holding.currentPrice) : '-'}
                      </Text>
                    </View>
                    
                    <View style={styles.holdingRow}>
                      <Text style={styles.holdingLabel}>Value:</Text>
                      <Text style={styles.holdingText}>{formatCurrency(currentValue)}</Text>
                    </View>
                    
                    <View style={styles.holdingRow}>
                      <Text style={styles.holdingLabel}>Gain/Loss:</Text>
                      <Text style={[styles.holdingText, { color: getChangeColor(gainLoss) }]}>
                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 6,
  },
  refreshButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  holdingsContainer: {
    padding: 16,
  },
  holdingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  holdingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  holdingName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  holdingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  holdingDetails: {
    gap: 8,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  holdingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});