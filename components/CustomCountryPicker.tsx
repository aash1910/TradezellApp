import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COUNTRY_NAMES } from './countryNames';

export type CountryItem = {
  cca2: string;
  callingCode: string[];
  name: string;
};

function getCountryList(): CountryItem[] {
  return getCountries()
    .map((cca2) => ({
      cca2,
      callingCode: [getCountryCallingCode(cca2)],
      name: COUNTRY_NAMES[cca2] ?? cca2,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const COUNTRY_LIST = getCountryList();

function getFlagEmoji(cca2: string): string {
  if (!cca2 || cca2.length !== 2) return '';
  return [...cca2]
    .map((c) => String.fromCodePoint(0x1f1a5 + c.charCodeAt(0)))
    .join('');
}

type CustomCountryPickerProps = {
  countryCode: string;
  onSelect: (country: CountryItem) => void;
  containerStyle?: object;
};

export function CustomCountryPicker({
  countryCode,
  onSelect,
  containerStyle,
}: CustomCountryPickerProps) {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const currentCountry = useMemo(
    () => COUNTRY_LIST.find((c) => c.cca2 === countryCode) ?? COUNTRY_LIST.find((c) => c.cca2 === 'US'),
    [countryCode]
  );

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRY_LIST;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cca2.toLowerCase().includes(q) ||
        c.callingCode[0].includes(searchQuery.trim())
    );
  }, [searchQuery]);

  const handleSelect = (country: CountryItem) => {
    onSelect(country);
    setVisible(false);
    setSearchQuery('');
  };

  const openModal = () => {
    setSearchQuery('');
    setVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, containerStyle]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{currentCountry ? getFlagEmoji(currentCountry.cca2) : '🌐'}</Text>
        <Text style={styles.callingCode}>
          +{currentCountry?.callingCode[0] ?? '1'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select country</Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <FlatList
              data={filteredList}
              keyExtractor={(item) => item.cca2}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.listFlag}>{getFlagEmoji(item.cca2)}</Text>
                  <Text style={styles.listItemText}>{item.name}</Text>
                  <Text style={styles.listItemCode}>+{item.callingCode[0]}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
  },
  flag: {
    fontSize: 22,
    marginRight: 6,
  },
  callingCode: {
    fontSize: 16,
    color: '#212121',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    fontSize: 22,
    color: '#616161',
    padding: 4,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    fontSize: 16,
    color: '#212121',
  },
  list: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  listItemCode: {
    fontSize: 15,
    color: '#616161',
  },
});
