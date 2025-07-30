import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAddHolding } from '../src/hooks/usePortfolio';
import { useSearch } from '../src/hooks/useSearch';
import { CreateHoldingRequest, SearchResult } from '@portfolio/shared';

export default function AddHoldingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');

  const { data: searchResults } = useSearch(searchQuery);
  const addHolding = useAddHolding();

  const handleSubmit = async () => {
    if (!selectedAsset || !quantity || !costBasis) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const holding: CreateHoldingRequest = {
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      type: selectedAsset.type,
      quantity: parseFloat(quantity),
      costBasis: parseFloat(costBasis),
    };

    try {
      await addHolding.mutateAsync(holding);
      Alert.alert('Success', 'Holding added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add holding');
    }
  };

  const selectAsset = (asset: SearchResult) => {
    setSelectedAsset(asset);
    setSearchQuery(asset.symbol);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectAsset(item)}
    >
      <View style={styles.searchResultContent}>
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultSymbol}>{item.symbol}</Text>
          <Text style={styles.searchResultName}>{item.name}</Text>
        </View>
        <View style={[
          styles.typeTag,
          item.type === 'stock' ? styles.stockTag : styles.cryptoTag
        ]}>
          <Text style={[
            styles.typeTagText,
            item.type === 'stock' ? styles.stockTagText : styles.cryptoTagText
          ]}>
            {item.type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Search Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Search Asset</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setSelectedAsset(null);
                }}
                placeholder="Search stocks or crypto..."
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Search Results */}
          {searchQuery && !selectedAsset && searchResults && searchResults.length > 0 && (
            <View style={styles.section}>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item, index) => `${item.symbol}-${index}`}
                style={styles.searchResults}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Selected Asset */}
          {selectedAsset && (
            <View style={styles.section}>
              <Text style={styles.label}>Selected Asset</Text>
              <View style={styles.selectedAsset}>
                <View style={styles.selectedAssetInfo}>
                  <Text style={styles.selectedAssetSymbol}>{selectedAsset.symbol}</Text>
                  <Text style={styles.selectedAssetName}>{selectedAsset.name}</Text>
                </View>
                <View style={[
                  styles.typeTag,
                  selectedAsset.type === 'stock' ? styles.stockTag : styles.cryptoTag
                ]}>
                  <Text style={[
                    styles.typeTagText,
                    selectedAsset.type === 'stock' ? styles.stockTagText : styles.cryptoTagText
                  ]}>
                    {selectedAsset.type}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Quantity Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          {/* Cost Basis Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Average Cost per Share/Coin</Text>
            <TextInput
              style={styles.input}
              value={costBasis}
              onChangeText={setCostBasis}
              placeholder="Enter cost basis"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedAsset || !quantity || !costBasis || addHolding.isPending) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedAsset || !quantity || !costBasis || addHolding.isPending}
        >
          <Text style={styles.submitButtonText}>
            {addHolding.isPending ? 'Adding...' : 'Add Holding'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  searchResults: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    maxHeight: 200,
  },
  searchResultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchResultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  searchResultName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  selectedAsset: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedAssetInfo: {
    flex: 1,
  },
  selectedAssetSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedAssetName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockTag: {
    backgroundColor: '#dbeafe',
  },
  cryptoTag: {
    backgroundColor: '#fed7aa',
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  stockTagText: {
    color: '#1e40af',
  },
  cryptoTagText: {
    color: '#c2410c',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});