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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// --- Categories List ---
const CATEGORIES = [
    'Техника',
    'Одежда и обувь',
    'Игры',
    'Спорт',
    'Обучение и курсы',
    'Другое',
];

type SortOption = 'none' | 'price-asc' | 'price-desc';

// --- Data Types ---
export interface WishItem {
    id: string;
    title: string;
    price?: string;
    category?: string;
    imageUri?: string;
    link?: string;
    notes?: string;
    isCompleted: boolean;
    isArchived: boolean;
}

type Language = 'ru' | 'en' | 'hy';

const DEFAULT_IMAGE = 'https://via.placeholder.com/150/e0e0e0/808080?text=Wish';
const CURRENCIES = ['₽', '֏', '£', '$', '€'];

// --- Translations ---
const TRANSLATIONS = {
    ru: {
        wishlistTab: 'Желания',
        completedTab: 'Исполнено',
        archiveTab: 'Архив',
        newWish: 'Новое желание',
        editWish: 'Редактировать',
        titleLabel: 'НАЗВАНИЕ',
        titlePlaceholder: 'Что вы хотите?',
        categoryLabel: 'КАТЕГОРИЯ',
        priceLabel: 'ЦЕНА',
        pricePlaceholder: 'например 99',
        photoLabel: 'ФОТОГРАФИЯ',
        pickPhoto: 'Выбрать фото',
        changePhoto: 'Изменить фото',
        linkLabel: 'ССЫЛКА',
        notesLabel: 'ЗАМЕТКИ',
        notesPlaceholder: 'Дополнительные заметки...',
        cancel: 'Отмена',
        delete: 'Удалить',
        archive: 'В архив',
        unarchive: 'Из архива',
        save: 'Сохранить',
        update: 'Обновить',
        emptyWishlist: 'Ваш список желаний пуст',
        emptyCompleted: 'Пока нет исполненных желаний',
        emptyArchive: 'В архиве ничего нет',
        errorTitle: 'Ошибка',
        errorTitleMsg: 'Пожалуйста, введите название!',
        errorPermission: 'Требуется разрешение на доступ к галерее!',
        linkText: 'Открыть ссылку',
        settingsTitle: 'Настройки',
        themeLabel: 'Тема приложения',
        themeDark: 'Тёмная',
        themeLight: 'Светлая',
        langLabel: 'Язык интерфейса',
        currencyLabel: 'Валюта по умолчанию',
        close: 'Закрыть',
        saveSettings: 'Сохранить',
        sortTitle: 'Сортировка и фильтры',
        sortPriceLabel: 'Сортировка по цене',
        sortNone: 'Без сортировки (по дате)',
        sortCheap: 'Сначала дешевые',
        sortExpensive: 'Сначала дорогие',
        filterCategoryLabel: 'Фильтр по категориям',
        allCategories: 'Все категории',
    },
    en: {
        wishlistTab: 'Wishlist',
        completedTab: 'Completed',
        archiveTab: 'Archive',
        newWish: 'New Wish',
        editWish: 'Edit Wish',
        titleLabel: 'TITLE',
        titlePlaceholder: 'What do you wish for?',
        categoryLabel: 'CATEGORY',
        priceLabel: 'PRICE',
        pricePlaceholder: 'e.g. 99',
        photoLabel: 'PHOTO',
        pickPhoto: 'Pick a photo',
        changePhoto: 'Change photo',
        linkLabel: 'LINK',
        notesLabel: 'NOTES',
        notesPlaceholder: 'Any extra notes...',
        cancel: 'Cancel',
        delete: 'Delete',
        archive: 'Archive',
        unarchive: 'Unarchive',
        save: 'Save',
        update: 'Update',
        emptyWishlist: 'Your wishlist is empty',
        emptyCompleted: 'No completed wishes yet',
        emptyArchive: 'Archive is empty',
        errorTitle: 'Error',
        errorTitleMsg: 'Please enter a title!',
        errorPermission: 'Permission to access gallery is required!',
        linkText: 'Open link',
        settingsTitle: 'Settings',
        themeLabel: 'App Theme',
        themeDark: 'Dark',
        themeLight: 'Light',
        langLabel: 'Interface Language',
        currencyLabel: 'Default Currency',
        close: 'Close',
        saveSettings: 'Save',
        sortTitle: 'Sort & Filter',
        sortPriceLabel: 'Sort by Price',
        sortNone: 'Default (by date)',
        sortCheap: 'Cheapest first',
        sortExpensive: 'Most expensive first',
        filterCategoryLabel: 'Filter by Category',
        allCategories: 'All Categories',
    },
    hy: {
        wishlistTab: 'Ցանկություններ',
        completedTab: 'Կատարված',
        archiveTab: 'Արխիվ',
        newWish: 'Նոր ցանկություն',
        editWish: 'Խմբագրել',
        titleLabel: 'ԱՆՎԱՆՈՒՄ',
        titlePlaceholder: 'Ի՞նչ եք ցանկանում:',
        categoryLabel: 'ԿԱՏԵԳՈՐԻԱ',
        priceLabel: 'ԳԻՆ',
        pricePlaceholder: 'օրինակ՝ 99',
        photoLabel: 'ԼՈՒՍԱՆԿԱՐ',
        pickPhoto: 'Ընտրել լուսանկար',
        changePhoto: 'Փոխել լուսանկարը',
        linkLabel: 'ՀՂՈՒՄ',
        notesLabel: 'ՆՇՈՒՄՆԵՐ',
        notesPlaceholder: 'Լրացուցիչ նշումներ...',
        cancel: 'Չեղարկել',
        delete: 'Ջնջել',
        archive: 'Արխիվացնել',
        unarchive: 'Վերականգնել',
        save: 'Պահպանել',
        update: 'Թարմացնել',
        emptyWishlist: 'Ձեր ցանկությունների ցուցակը դատարկ է',
        emptyCompleted: 'Դեռևս կատարված ցանկություններ չկան',
        emptyArchive: 'Արխիվը դատարկ է',
        errorTitle: 'Սխալ',
        errorTitleMsg: 'Խնդրում ենք մուտքագրել անվանումը:',
        errorPermission: 'Պահանջվում է պատկերասրահի հասանելիություն:',
        linkText: 'Բացել հղումը',
        settingsTitle: 'Կարգավորումներ',
        themeLabel: 'Ծրագրի ոճը',
        themeDark: 'Մութ',
        themeLight: 'Լուսավոր',
        langLabel: 'Լեզուն',
        currencyLabel: 'Հիմնական արժույթը',
        close: 'Փակել',
        saveSettings: 'Պահպանել',
        sortTitle: 'Տեսակավորում և ֆիլտրեր',
        sortPriceLabel: 'Տեսակավորում ըստ գնի',
        sortNone: 'Սկզբնական (ըստ ամսաթվի)',
        sortCheap: 'Սկզբում էժանները',
        sortExpensive: 'Սկզբում թանկերը',
        filterCategoryLabel: 'Ֆիլտրել ըստ կատեգորիայի',
        allCategories: 'Բոլոր կատեգորիաները',
    }
};

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
    const [items, setItems] = useState<WishItem[]>([]);

    // Global Active Settings State
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [lang, setLang] = useState<Language>('ru');
    const [globalCurrency, setGlobalCurrency] = useState('₽');

    // Filter & Sort State
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('none');

    // Temporary Settings State
    const [tempIsDarkMode, setTempIsDarkMode] = useState(isDarkMode);
    const [tempLang, setTempLang] = useState<Language>(lang);
    const [tempCurrency, setTempCurrency] = useState(globalCurrency);

    // Modals Visibility
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const [isSortVisible, setSortVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<WishItem | null>(null);

    const t = TRANSLATIONS[lang];

    // Modern Eye-Friendly Palette
    const theme = {
        background: isDarkMode ? '#12131C' : '#F7F8FA',
        card: isDarkMode ? '#1E1F2B' : '#FFFFFF',
        text: isDarkMode ? '#E8E9F3' : '#1A1C1E',
        subText: isDarkMode ? '#8E92A8' : '#8C91A0',
        inputBg: isDarkMode ? '#28293B' : '#F1F3F7',
        headerBg: isDarkMode ? '#12131C' : '#F7F8FA',
        tabBg: isDarkMode ? '#1E1F2B' : '#FFFFFF',
        border: isDarkMode ? '#2B2C3D' : '#EAECEF',
        primary: '#5B67CA',
        accentGreen: '#34C759',
        accentRed: '#FF453A',
        badgeBg: isDarkMode ? 'rgba(52, 199, 89, 0.15)' : 'rgba(52, 199, 89, 0.10)',
        shadowColor: isDarkMode ? '#000000' : '#5B67CA',
    };

    // Form State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [imageUri, setImageUri] = useState('');
    const [link, setLink] = useState('');
    const [notes, setNotes] = useState('');

    const [, setSelectedCompletedItem] = useState<WishItem | null>(null);

    // --- Open Settings Handler ---
    const openSettings = () => {
        setTempIsDarkMode(isDarkMode);
        setTempLang(lang);
        setTempCurrency(globalCurrency);
        setSettingsVisible(true);
    };

    // --- Save Settings Handler ---
    const handleSaveSettings = () => {
        setIsDarkMode(tempIsDarkMode);
        setLang(tempLang);
        setGlobalCurrency(tempCurrency);
        setSettingsVisible(false);
    };

    // Helper to get raw numeric price from formatted string
    const extractPriceValue = (priceStr?: string): number => {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    };

    const parsePriceNumber = (priceStr?: string) => {
        if (!priceStr) return '';
        const foundCurr = CURRENCIES.find((c) => priceStr.includes(c));
        return foundCurr ? priceStr.replace(foundCurr, '').trim() : priceStr.trim();
    };

    // --- Open Modal Handler ---
    const openEditModal = (item?: WishItem) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setPrice(parsePriceNumber(item.price));
            setCategory(item.category || CATEGORIES[0]);
            setImageUri(item.imageUri || '');
            setLink(item.link || '');
            setNotes(item.notes || '');
        } else {
            setEditingItem(null);
            setTitle('');
            setPrice('');
            setCategory(CATEGORIES[0]);
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
            Alert.alert(t.errorTitle, t.errorPermission);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // --- Save (Create / Update) ---
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert(t.errorTitle, t.errorTitleMsg);
            return;
        }

        const formattedPrice = price.trim() ? `${price.trim()} ${globalCurrency}` : '';

        if (editingItem) {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === editingItem.id
                        ? { ...item, title, price: formattedPrice, category, imageUri, link, notes }
                        : item
                )
            );
        } else {
            const newItem: WishItem = {
                id: Date.now().toString(),
                title,
                price: formattedPrice,
                category,
                imageUri,
                link,
                notes,
                isCompleted: false,
                isArchived: false,
            };
            setItems((prev) => [...prev, newItem]);
        }

        setEditModalVisible(false);
    };

    // --- Delete Item ---
    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setEditModalVisible(false);
    };

    // --- Archive Item ---
    const handleArchiveToggle = (id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isArchived: !item.isArchived } : item
            )
        );
        setEditModalVisible(false);
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
    const WishList = ({ type }: { type: 'active' | 'completed' | 'archived' }) => {
        // 1. Filter by Tab & Category
        let filteredData = items.filter((i) => {
            let matchesTab = false;
            if (type === 'archived') {
                matchesTab = i.isArchived === true;
            } else if (type === 'completed') {
                matchesTab = i.isCompleted === true && !i.isArchived;
            } else {
                matchesTab = !i.isCompleted && !i.isArchived;
            }

            const matchesCategory = selectedCategory ? i.category === selectedCategory : true;
            return matchesTab && matchesCategory;
        });

        // 2. Sort Data by Price if selected
        if (sortOption === 'price-asc') {
            filteredData = [...filteredData].sort(
                (a, b) => extractPriceValue(a.price) - extractPriceValue(b.price)
            );
        } else if (sortOption === 'price-desc') {
            filteredData = [...filteredData].sort(
                (a, b) => extractPriceValue(b.price) - extractPriceValue(a.price)
            );
        }

        const getEmptyMessage = () => {
            if (type === 'archived') return t.emptyArchive;
            if (type === 'completed') return t.emptyCompleted;
            return t.emptyWishlist;
        };

        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                    shadowColor: theme.shadowColor,
                                },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                                if (type === 'completed') {
                                    setSelectedCompletedItem(item);
                                } else {
                                    openEditModal(item);
                                }
                            }}
                        >
                            <TouchableOpacity
                                style={styles.radioContainer}
                                onPress={() => {
                                    if (type === 'archived') {
                                        handleArchiveToggle(item.id);
                                    } else {
                                        toggleComplete(item.id);
                                    }
                                }}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons
                                    name={
                                        type === 'archived'
                                            ? 'archive-outline'
                                            : item.isCompleted
                                                ? 'checkmark-circle'
                                                : 'ellipse-outline'
                                    }
                                    size={24}
                                    color={
                                        type === 'archived'
                                            ? theme.primary
                                            : item.isCompleted
                                                ? theme.accentGreen
                                                : theme.subText
                                    }
                                />
                            </TouchableOpacity>

                            <Image
                                source={{ uri: item.imageUri || DEFAULT_IMAGE }}
                                style={styles.cardImage}
                            />

                            <View style={styles.cardContent}>
                                <Text
                                    style={[
                                        styles.cardTitle,
                                        {
                                            color: theme.text,
                                            textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                                            opacity: item.isCompleted ? 0.5 : 1,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                {item.category ? (
                                    <Text style={[styles.categoryBadgeText, { color: theme.primary }]}>
                                        {item.category}
                                    </Text>
                                ) : null}
                                {item.link ? (
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(item.link!)}
                                        style={styles.linkBadge}
                                    >
                                        <Ionicons name="link-outline" size={12} color={theme.primary} />
                                        <Text style={[styles.linkText, { color: theme.primary }]} numberOfLines={1}>
                                            {t.linkText}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {item.price ? (
                                <View style={[styles.priceBadge, { backgroundColor: theme.badgeBg }]}>
                                    <Text style={[styles.price, { color: theme.accentGreen }]}>{item.price}</Text>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconBg, { backgroundColor: theme.inputBg }]}>
                                <Ionicons
                                    name={type === 'archived' ? 'archive-outline' : 'gift-outline'}
                                    size={48}
                                    color={theme.subText}
                                />
                            </View>
                            <Text style={[styles.emptyText, { color: theme.subText }]}>
                                {getEmptyMessage()}
                            </Text>
                        </View>
                    }
                />

                {type === 'active' && (
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: theme.primary }]}
                        activeOpacity={0.85}
                        onPress={() => openEditModal()}
                    >
                        <Ionicons name="add" size={32} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const hasActiveFilterOrSort = selectedCategory !== null || sortOption !== 'none';

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, focused }) => {
                        let iconName: keyof typeof Ionicons.glyphMap = 'gift-outline';
                        if (route.name === 'Wishlist') {
                            iconName = focused ? 'gift' : 'gift-outline';
                        } else if (route.name === 'Archived') {
                            iconName = focused ? 'archive' : 'archive-outline';
                        } else if (route.name === 'Completed') {
                            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                        }
                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.subText,
                    tabBarStyle: {
                        backgroundColor: theme.tabBg,
                        borderTopColor: theme.border,
                        height: 68,
                        paddingBottom: 12,
                        paddingTop: 8,
                        elevation: 0,
                    },
                    headerStyle: {
                        backgroundColor: theme.headerBg,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTitleStyle: {
                        color: theme.text,
                        fontWeight: '700',
                        fontSize: 20
                    },
                    headerTitleAlign: 'center',
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={openSettings}
                            style={styles.headerLeftBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="settings-outline" size={22} color={theme.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => setSortVisible(true)}
                            style={styles.headerRightBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="filter-outline"
                                size={22}
                                color={hasActiveFilterOrSort ? theme.primary : theme.text}
                            />
                        </TouchableOpacity>
                    ),
                })}
            >
                <Tab.Screen name="Wishlist" options={{ title: t.wishlistTab }}>
                    {() => <WishList type="active" />}
                </Tab.Screen>
                <Tab.Screen name="Archived" options={{ title: t.archiveTab }}>
                    {() => <WishList type="archived" />}
                </Tab.Screen>
                <Tab.Screen name="Completed" options={{ title: t.completedTab }}>
                    {() => <WishList type="completed" />}
                </Tab.Screen>
            </Tab.Navigator>

            {/* --- Sort & Filter Modal --- */}
            <Modal
                visible={isSortVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSortVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSortVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.modalSheet, { backgroundColor: theme.card }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.handleBar} />
                        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {t.sortTitle}
                            </Text>

                            {/* --- Section 1: Price Sorting --- */}
                            <Text style={[styles.sectionLabel, { color: theme.subText }]}>
                                {t.sortPriceLabel}
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.categoryOption,
                                    { backgroundColor: theme.inputBg },
                                    sortOption === 'none' && { borderColor: theme.primary, borderWidth: 1 }
                                ]}
                                onPress={() => setSortOption('none')}
                            >
                                <Text style={[styles.categoryOptionText, { color: theme.text }]}>
                                    {t.sortNone}
                                </Text>
                                {sortOption === 'none' && (
                                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryOption,
                                    { backgroundColor: theme.inputBg },
                                    sortOption === 'price-asc' && { borderColor: theme.primary, borderWidth: 1 }
                                ]}
                                onPress={() => setSortOption('price-asc')}
                            >
                                <Text style={[styles.categoryOptionText, { color: theme.text }]}>
                                    {t.sortCheap}
                                </Text>
                                {sortOption === 'price-asc' && (
                                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryOption,
                                    { backgroundColor: theme.inputBg },
                                    sortOption === 'price-desc' && { borderColor: theme.primary, borderWidth: 1 }
                                ]}
                                onPress={() => setSortOption('price-desc')}
                            >
                                <Text style={[styles.categoryOptionText, { color: theme.text }]}>
                                    {t.sortExpensive}
                                </Text>
                                {sortOption === 'price-desc' && (
                                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>

                            {/* --- Section 2: Category Filter --- */}
                            <Text style={[styles.sectionLabel, { color: theme.subText, marginTop: 16 }]}>
                                {t.filterCategoryLabel}
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.categoryOption,
                                    { backgroundColor: theme.inputBg },
                                    selectedCategory === null && { borderColor: theme.primary, borderWidth: 1 }
                                ]}
                                onPress={() => setSelectedCategory(null)}
                            >
                                <Text style={[styles.categoryOptionText, { color: theme.text }]}>
                                    {t.allCategories}
                                </Text>
                                {selectedCategory === null && (
                                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>

                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryOption,
                                        { backgroundColor: theme.inputBg },
                                        selectedCategory === cat && { borderColor: theme.primary, borderWidth: 1 }
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text style={[styles.categoryOptionText, { color: theme.text }]}>
                                        {cat}
                                    </Text>
                                    {selectedCategory === cat && (
                                        <Ionicons name="checkmark" size={20} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: theme.primary, marginTop: 20 }]}
                                onPress={() => setSortVisible(false)}
                            >
                                <Text style={[styles.btnText, { color: '#FFF' }]}>
                                    {t.close}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* --- Settings Modal --- */}
            <Modal
                visible={isSettingsVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSettingsVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSettingsVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.modalSheet, { backgroundColor: theme.card }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.handleBar} />
                        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {TRANSLATIONS[tempLang].settingsTitle}
                            </Text>

                            {/* Theme Setting */}
                            <Text style={[styles.sectionLabel, { color: theme.subText }]}>
                                {TRANSLATIONS[tempLang].themeLabel}
                            </Text>
                            <View style={[styles.segmentedControl, { backgroundColor: theme.inputBg }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.segmentBtn,
                                        !tempIsDarkMode && [styles.segmentActive, { backgroundColor: theme.card }],
                                    ]}
                                    onPress={() => setTempIsDarkMode(false)}
                                >
                                    <Text style={[styles.segmentText, { color: theme.text }]}>
                                        {TRANSLATIONS[tempLang].themeLight}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.segmentBtn,
                                        tempIsDarkMode && [styles.segmentActive, { backgroundColor: theme.card }],
                                    ]}
                                    onPress={() => setTempIsDarkMode(true)}
                                >
                                    <Text style={[styles.segmentText, { color: theme.text }]}>
                                        {TRANSLATIONS[tempLang].themeDark}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Language Setting */}
                            <Text style={[styles.sectionLabel, { color: theme.subText, marginTop: 20 }]}>
                                {TRANSLATIONS[tempLang].langLabel}
                            </Text>
                            <View style={[styles.segmentedControl, { backgroundColor: theme.inputBg }]}>
                                {(['ru', 'en', 'hy'] as Language[]).map((l) => (
                                    <TouchableOpacity
                                        key={l}
                                        style={[
                                            styles.segmentBtn,
                                            tempLang === l && [styles.segmentActive, { backgroundColor: theme.card }],
                                        ]}
                                        onPress={() => setTempLang(l)}
                                    >
                                        <Text style={[styles.segmentText, { color: theme.text }]}>
                                            {l.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Default Currency Setting */}
                            <Text style={[styles.sectionLabel, { color: theme.subText, marginTop: 20 }]}>
                                {TRANSLATIONS[tempLang].currencyLabel}
                            </Text>
                            <View style={[styles.segmentedControl, { backgroundColor: theme.inputBg }]}>
                                {CURRENCIES.map((curr) => (
                                    <TouchableOpacity
                                        key={curr}
                                        style={[
                                            styles.segmentBtn,
                                            tempCurrency === curr && [styles.segmentActive, { backgroundColor: theme.card }],
                                        ]}
                                        onPress={() => setTempCurrency(curr)}
                                    >
                                        <Text style={[styles.segmentText, { color: theme.text }]}>
                                            {curr}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: theme.inputBg }]}
                                    onPress={() => setSettingsVisible(false)}
                                >
                                    <Text style={[styles.btnText, { color: theme.text }]}>
                                        {TRANSLATIONS[tempLang].cancel}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: theme.primary }]}
                                    onPress={handleSaveSettings}
                                >
                                    <Text style={[styles.btnText, { color: '#FFF' }]}>
                                        {TRANSLATIONS[tempLang].saveSettings}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

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
                            style={[styles.modalSheet, { backgroundColor: theme.card }]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={styles.handleBar} />
                            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>
                                    {editingItem ? t.editWish : t.newWish}
                                </Text>

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.titleLabel}</Text>
                                <TextInput
                                    style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                                    placeholder={t.titlePlaceholder}
                                    placeholderTextColor={theme.subText}
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.categoryLabel}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.chip,
                                                { backgroundColor: theme.inputBg },
                                                category === cat && { backgroundColor: theme.primary }
                                            ]}
                                            onPress={() => setCategory(cat)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                { color: theme.text },
                                                category === cat && { color: '#FFF', fontWeight: 'bold' }
                                            ]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.priceLabel}</Text>
                                <TextInput
                                    style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                                    placeholder={t.pricePlaceholder}
                                    placeholderTextColor={theme.subText}
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                />

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.photoLabel}</Text>
                                <TouchableOpacity
                                    style={[styles.photoPickerBox, { backgroundColor: theme.inputBg }]}
                                    onPress={pickImage}
                                    activeOpacity={0.7}
                                >
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                    ) : (
                                        <View style={styles.photoPlaceholder}>
                                            <Ionicons name="camera-outline" size={22} color={theme.primary} />
                                        </View>
                                    )}
                                    <Text style={[styles.photoPickerText, { color: theme.primary }]}>
                                        {imageUri ? t.changePhoto : t.pickPhoto}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.linkLabel}</Text>
                                <TextInput
                                    style={[styles.modernInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                                    placeholder="https://..."
                                    placeholderTextColor={theme.subText}
                                    value={link}
                                    onChangeText={setLink}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                />

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.notesLabel}</Text>
                                <TextInput
                                    style={[
                                        styles.modernInput,
                                        { backgroundColor: theme.inputBg, color: theme.text, height: 100, textAlignVertical: 'top', paddingTop: 14 }
                                    ]}
                                    placeholder={t.notesPlaceholder}
                                    placeholderTextColor={theme.subText}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                />

                                {/* --- Action Buttons Container --- */}
                                <View style={styles.actionContainer}>
                                    {editingItem ? (
                                        <>
                                            <View style={styles.secondaryActionRow}>
                                                <TouchableOpacity
                                                    style={[styles.btn, { backgroundColor: theme.inputBg }]}
                                                    onPress={() => setEditModalVisible(false)}
                                                >
                                                    <Text style={[styles.btnText, { color: theme.text }]}>
                                                        {t.cancel}
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.btn, { backgroundColor: 'rgba(91, 103, 202, 0.15)' }]}
                                                    onPress={() => handleArchiveToggle(editingItem.id)}
                                                >
                                                    <Text style={[styles.btnText, { color: theme.primary }]}>
                                                        {editingItem.isArchived ? t.unarchive : t.archive}
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.btn, { backgroundColor: 'rgba(255, 69, 58, 0.12)' }]}
                                                    onPress={() => handleDelete(editingItem.id)}
                                                >
                                                    <Text style={[styles.btnText, { color: theme.accentRed }]}>
                                                        {t.delete}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            <TouchableOpacity
                                                style={[styles.btn, styles.fullWidthBtn, { backgroundColor: theme.primary }]}
                                                onPress={handleSave}
                                            >
                                                <Text style={[styles.btnText, { color: '#FFF' }]}>
                                                    {t.update}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity
                                                style={[styles.btn, { backgroundColor: theme.inputBg }]}
                                                onPress={() => setEditModalVisible(false)}
                                            >
                                                <Text style={[styles.btnText, { color: theme.text }]}>
                                                    {t.cancel}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.btn, { backgroundColor: theme.primary }]}
                                                onPress={handleSave}
                                            >
                                                <Text style={[styles.btnText, { color: '#FFF' }]}>
                                                    {t.save}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

// --- Smooth & Modern Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerLeftBtn: {
        marginLeft: 18,
        padding: 4,
    },
    headerRightBtn: {
        marginRight: 18,
        padding: 4,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    radioContainer: {
        marginRight: 10,
    },
    cardImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    linkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    linkText: {
        fontSize: 12,
        marginLeft: 4,
    },
    priceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    price: {
        fontSize: 13,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 12,
        maxHeight: '85%',
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#CCC',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    modernInput: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    chipText: {
        fontSize: 13,
    },
    photoPickerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        marginBottom: 16,
    },
    photoPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    previewImage: {
        width: 36,
        height: 36,
        borderRadius: 8,
        marginRight: 10,
    },
    photoPickerText: {
        fontSize: 14,
        fontWeight: '600',
    },
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    segmentActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
    },
    categoryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryOptionText: {
        fontSize: 15,
        fontWeight: '500',
    },
    actionContainer: {
        marginTop: 16,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryActionRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    fullWidthBtn: {
        width: '100%',
    },
    btn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: 14,
        fontWeight: '600',
    },
});