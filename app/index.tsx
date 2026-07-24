import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Image,
    Linking,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// --- Data Types ---
export interface WishItem {
    id: string;
    title: string;
    price?: string;
    imageUri?: string;
    link?: string;
    notes?: string;
    isCompleted: boolean;
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/150/e0e0e0/808080?text=Wish';

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
    const [items, setItems] = useState<WishItem[]>([]);

    // Add / Edit Modal State
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<WishItem | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [link, setLink] = useState('');
    const [notes, setNotes] = useState('');

    // Completed Actions Modal State
    const [isCompletedModalVisible, setCompletedModalVisible] = useState(false);
    const [selectedCompletedItem, setSelectedCompletedItem] = useState<WishItem | null>(null);

    // --- Open Modal Handler ---
    const openEditModal = (item?: WishItem) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setPrice(item.price || '');
            setImageUri(item.imageUri || '');
            setLink(item.link || '');
            setNotes(item.notes || '');
        } else {
            setEditingItem(null);
            setTitle('');
            setPrice('');
            setImageUri('');
            setLink('');
            setNotes('');
        }
        setEditModalVisible(true);
    };

    // --- Pick Image ---
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Error', 'Permission to access gallery is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // --- Save (Create / Update) ---
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title!');
            return;
        }

        if (editingItem) {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === editingItem.id
                        ? { ...item, title, price, imageUri, link, notes }
                        : item
                )
            );
        } else {
            const newItem: WishItem = {
                id: Date.now().toString(),
                title,
                price,
                imageUri,
                link,
                notes,
                isCompleted: false,
            };
            setItems((prev) => [...prev, newItem]);
        }

        setEditModalVisible(false);
    };

    // --- Delete Item ---
    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setEditModalVisible(false);
        setCompletedModalVisible(false);
    };

    // --- Toggle Complete State ---
    const toggleComplete = (id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
            )
        );
    };

    // --- List Component ---
    const WishList = ({ completedOnly }: { completedOnly: boolean }) => {
        const filteredData = items.filter((i) => i.isCompleted === completedOnly);

        return (
            <View style={styles.container}>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (completedOnly) {
                                    setSelectedCompletedItem(item);
                                    setCompletedModalVisible(true);
                                } else {
                                    openEditModal(item);
                                }
                            }}
                        >
                            <TouchableOpacity
                                style={styles.radio}
                                onPress={() => toggleComplete(item.id)}
                            >
                                <Ionicons
                                    name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={24}
                                    color={item.isCompleted ? '#4CAF50' : '#888'}
                                />
                            </TouchableOpacity>

                            <Image
                                source={{ uri: item.imageUri || DEFAULT_IMAGE }}
                                style={styles.cardImage}
                            />

                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                {item.link ? (
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(item.link!)}
                                        style={styles.linkButton}
                                    >
                                        <Ionicons name="link-outline" size={14} color="#007AFF" />
                                        <Text style={styles.linkText} numberOfLines={1}>
                                            Link
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {item.price ? <Text style={styles.price}>{item.price}</Text> : null}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {completedOnly ? 'No completed wishes yet' : 'Your wishlist is empty'}
                        </Text>
                    }
                />

                {!completedOnly && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => openEditModal()}
                    >
                        <Ionicons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <>
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'gift-outline';
                    if (route.name === 'Wishlist') iconName = 'gift-outline';
                    else if (route.name === 'Completed') iconName = 'checkmark-done-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: true,
            })}
        >
            <Tab.Screen
                name="Wishlist"
                options={{ title: 'Wishlist' }}
            >
                {() => <WishList completedOnly={false} />}
            </Tab.Screen>
            <Tab.Screen
                name="Completed"
                options={{ title: 'Completed' }}
            >
                {() => <WishList completedOnly={true} />}
            </Tab.Screen>
        </Tab.Navigator>

            {/* --- Add / Edit Modal --- */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setEditModalVisible(false)}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.modalContent}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <ScrollView contentContainerStyle={{ padding: 20 }}>
                                <Text style={styles.modalHeader}>
                                    {editingItem ? 'Edit Wish' : 'New Wish'}
                                </Text>

                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="What do you wish for?"
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <Text style={styles.label}>Price</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. $99"
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="default"
                                />

                                <Text style={styles.label}>Photo</Text>
                                <TouchableOpacity
                                    style={styles.imagePicker}
                                    onPress={pickImage}
                                >
                                    {imageUri ? (
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={styles.previewImage}
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.previewImage,
                                                {
                                                    backgroundColor: '#E5E5EA',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="camera-outline"
                                                size={28}
                                                color="#8E8E93"
                                            />
                                        </View>
                                    )}
                                    <Text style={styles.imagePickerText}>
                                        {imageUri ? 'Change photo' : 'Pick a photo'}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.label}>Link</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="https://..."
                                    value={link}
                                    onChangeText={setLink}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                />

                                <Text style={styles.label}>Notes</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Any extra notes..."
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnCancel]}
                                        onPress={() => setEditModalVisible(false)}
                                    >
                                        <Text style={[styles.btnText, { color: '#333' }]}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>

                                    {editingItem && (
                                        <TouchableOpacity
                                            style={[styles.btn, styles.btnDelete]}
                                            onPress={() => handleDelete(editingItem.id)}
                                        >
                                            <Text style={styles.btnText}>Delete</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnSave]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.btnText}>
                                            {editingItem ? 'Update' : 'Save'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    radio: {
        paddingRight: 10,
    },
    cardImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#EEE',
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#34C759',
        marginLeft: 8,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    linkText: {
        color: '#007AFF',
        fontSize: 12,
        marginLeft: 4,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#8E8E93',
        fontSize: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    imagePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    imagePickerText: {
        marginLeft: 16,
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 30,
    },
    btn: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    btnSave: {
        backgroundColor: '#007AFF',
    },
    btnCancel: {
        backgroundColor: '#E5E5EA',
    },
    btnDelete: {
        backgroundColor: '#FF3B30',
    },
    btnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    // Dialog Styles
    modalOverlayCenter: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    dialogButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        width: '100%',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#CCC',
    },
    dialogButtonText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#007AFF',
    },
});