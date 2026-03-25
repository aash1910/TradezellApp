import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

const COLORS = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  background: '#F8FAF9',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textLight: '#6B7280',
  border: '#D1D5DB',
  error: '#EF4444',
};

const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'];
const CATEGORIES = ['Clothing', 'Shoes', 'Electronics', 'Books', 'Furniture', 'Jewellery', 'Sports', 'Toys', 'Art', 'Other'];

export default function AddListingScreen() {
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEdit = Boolean(editId);

  const [type, setType] = useState<'trade' | 'sell' | 'both'>('trade');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
      base64: true,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(a =>
        a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri
      );
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for your listing.');
      return;
    }
    if ((type === 'sell' || type === 'both') && !price) {
      Alert.alert('Required', 'Please enter a price for sell listings.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        condition: condition || undefined,
        category: category || undefined,
        images,
      };

      if (type !== 'trade' && price) {
        payload.price = parseFloat(price);
        payload.currency = 'USD';
      }

      if (isEdit) {
        await api.put(`/listings/${editId}`, payload);
      } else {
        await api.post('/listings', payload);
      }

      Alert.alert('Success', isEdit ? 'Listing updated!' : 'Listing created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Listing' : 'New Listing'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Listing type selector */}
        <Text style={styles.label}>Listing Type</Text>
        <View style={styles.typeRow}>
          {(['trade', 'sell', 'both'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}>
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t === 'trade' ? 'Trade' : t === 'sell' ? 'Sell' : 'Trade & Sell'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What are you offering?"
          placeholderTextColor={COLORS.textLight}
          maxLength={100}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your item — size, brand, details..."
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        {/* Price (only for sell / both) */}
        {(type === 'sell' || type === 'both') && (
          <>
            <Text style={styles.label}>Price (USD) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
            />
          </>
        )}

        {/* Condition */}
        <Text style={styles.label}>Condition</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {CONDITIONS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, condition === c && styles.chipActive]}
              onPress={() => setCondition(condition === c ? '' : c)}>
              <Text style={[styles.chipText, condition === c && styles.chipTextActive]}>
                {c.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(category === c ? '' : c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Images */}
        <Text style={styles.label}>Photos (up to 5)</Text>
        <View style={styles.imagesRow}>
          {images.map((img, i) => (
            <View key={i} style={styles.imgWrapper}>
              <Image source={{ uri: img }} style={styles.imgThumb} />
              <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(i)}>
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
              <Text style={styles.addImgText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Update Listing' : 'Post Listing'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: COLORS.background },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:        { padding: 4 },
  headerTitle:    { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text },
  scroll:         { flex: 1 },
  scrollContent:  { padding: 20, paddingBottom: 40 },
  label:          { fontSize: 14, fontFamily: 'NunitoBold', color: COLORS.text, marginBottom: 6, marginTop: 16 },
  input:          { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  textArea:       { height: 100, textAlignVertical: 'top' },
  typeRow:        { flexDirection: 'row', gap: 10 },
  typeBtn:        { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  typeBtnActive:  { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  typeBtnText:    { fontSize: 13, color: COLORS.textLight, fontFamily: 'NunitoBold' },
  typeBtnTextActive: { color: COLORS.primary },
  chipsRow:       { marginBottom: 4, marginTop: 2 },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: COLORS.white },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 13, color: COLORS.textLight, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white, fontFamily: 'NunitoBold' },
  imagesRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  imgWrapper:     { position: 'relative' },
  imgThumb:       { width: 80, height: 80, borderRadius: 10 },
  imgRemove:      { position: 'absolute', top: -6, right: -6 },
  addImgBtn:      { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addImgText:     { fontSize: 11, color: COLORS.primary, marginTop: 2 },
  saveBtn:        { marginTop: 28, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled:{ opacity: 0.6 },
  saveBtnText:    { color: COLORS.white, fontSize: 16, fontFamily: 'NunitoBold' },
});
