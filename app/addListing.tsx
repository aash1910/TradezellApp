import React, { useEffect, useState } from 'react';
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
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { listingService } from '@/services/listing.service';
import { uploadService } from '@/services/upload.service';
import { resolveListingImageUri } from '@/utils/images';

const LISTING_SAVE_TIMEOUT_MS = 120000;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = Array.isArray(params.editId) ? params.editId[0] : params.editId;
  const isEdit = Boolean(editId);

  const [type, setType] = useState<'trade' | 'sell' | 'both'>('trade');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [compressingImages, setCompressingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;

    const listingId = Number(editId);
    if (!Number.isFinite(listingId)) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const listing = await listingService.getListing(listingId);
        if (cancelled) return;

        setType(listing.type);
        setTitle(listing.title ?? '');
        setDescription(listing.description ?? '');
        setCondition(listing.condition ?? '');
        setCategory(listing.category ?? '');
        setPrice(listing.price != null ? String(listing.price) : '');
        setImages(listing.images ?? []);
      } catch {
        if (!cancelled) {
          Alert.alert('Error', 'Could not load listing.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const pickImage = async () => {
    const remaining = 5 - images.length;
    if (remaining <= 0) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });

    if (!result.canceled) {
      setCompressingImages(true);
      try {
        const uris = result.assets.map((a) => a.uri).filter(Boolean) as string[];
        const compressed = await uploadService.compressImagesToDataUrls(uris);
        setImages((prev) => [...prev, ...compressed].slice(0, 5));
      } catch {
        Alert.alert('Error', 'Failed to process images. Please try again with smaller photos.');
      } finally {
        setCompressingImages(false);
      }
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

      const saveConfig = { timeout: LISTING_SAVE_TIMEOUT_MS };

      if (isEdit) {
        await api.put(`/listings/${editId}`, payload, saveConfig);
      } else {
        await api.post('/listings', payload, saveConfig);
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

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
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
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPreviewImage(resolveListingImageUri(img))}>
                <Image source={{ uri: resolveListingImageUri(img) }} style={styles.imgThumb} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(i)}>
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              style={[styles.addImgBtn, compressingImages && styles.addImgBtnDisabled]}
              onPress={pickImage}
              disabled={compressingImages || saving}>
              {compressingImages ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
                  <Text style={styles.addImgText}>Add</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || compressingImages}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Update Listing' : 'Post Listing'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      )}

      <Modal
        visible={previewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.imageModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPreviewImage(null)} />
          <TouchableOpacity
            style={[styles.imageModalClose, { top: insets.top + 12 }]}
            onPress={() => setPreviewImage(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          {previewImage ? (
            <View style={styles.imageModalBody} pointerEvents="box-none">
              <Image
                source={{ uri: previewImage }}
                style={styles.imageModalImage}
                resizeMode="contain"
              />
            </View>
          ) : null}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: COLORS.background },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:        { padding: 4 },
  headerTitle:    { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text },
  loadingWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  addImgBtnDisabled: { opacity: 0.6 },
  addImgText:     { fontSize: 11, color: COLORS.primary, marginTop: 2 },
  saveBtn:        { marginTop: 28, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled:{ opacity: 0.6 },
  saveBtnText:    { color: COLORS.white, fontSize: 16, fontFamily: 'NunitoBold' },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  imageModalBody: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    padding: 8,
  },
  imageModalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
});
