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

type Language = 'ru' | 'en' | 'hy';
type SortOption = 'none' | 'price-asc' | 'price-desc';

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

const DEFAULT_IMAGE = 'https://via.placeholder.com/150/e0e0e0/808080?text=Wish';
const CURRENCIES = ['₽', '֏', '£', '$', '€'];

// --- Dynamic Categories ---
const CATEGORY_KEYS = ['tech', 'clothes', 'games', 'sport', 'education', 'other'] as const;

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
        emptyWishlist: 'Добавьте свой первый предмет',
        emptyWishlistSub: 'Нажмите на плюсик ниже, чтобы добавить желание!',
        emptyCategory: 'В этой категории пока ничего нет',
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
        recentlyAdded: 'Недавно добавленные',
        categoriesTitle: 'Категории',
        backBtn: 'Назад',
        totalPrice: 'Итого в категории:',
        cat_tech: 'Техника',
        cat_clothes: 'Одежда и обувь',
        cat_games: 'Игры',
        cat_sport: 'Спорт',
        cat_education: 'Обучение',
        cat_other: 'Другое',
        cat_all: 'Все предметы',
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
        emptyWishlist: 'Add your first item',
        emptyWishlistSub: 'Tap the plus button below to add your first wish!',
        emptyCategory: 'Nothing in this category yet',
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
        langLabel: 'Language',
        currencyLabel: 'Default Currency',
        close: 'Close',
        saveSettings: 'Save',
        sortTitle: 'Sort & Filter',
        sortPriceLabel: 'Sort by Price',
        sortNone: 'Default (by date)',
        sortCheap: 'Cheapest first',
        sortExpensive: 'Most expensive first',
        recentlyAdded: 'Recently Added',
        categoriesTitle: 'Categories',
        backBtn: 'Back',
        totalPrice: 'Category Total:',
        cat_tech: 'Tech',
        cat_clothes: 'Clothes',
        cat_games: 'Games',
        cat_sport: 'Sport',
        cat_education: 'Education',
        cat_other: 'Other',
        cat_all: 'All Items',
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
        emptyWishlist: 'Ավելացրեք ձեր առաջին իրը',
        emptyWishlistSub: 'Սեղմեք պլյուս կոճակը ներքևում',
        emptyCategory: 'Այս բաժնում դեռ ոչինչ չկա',
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
        recentlyAdded: 'Վերջին ավելացվածները',
        categoriesTitle: 'Կատեգորիաներ',
        backBtn: 'Հետ',
        totalPrice: 'Ընդհանուր գումարը՝',
        cat_tech: 'Տեխնիկա',
        cat_clothes: 'Հագուստ',
        cat_games: 'Խաղեր',
        cat_sport: 'Սպորտ',
        cat_education: 'Ուսուցում',
        cat_other: 'Այլ',
        cat_all: 'Բոլորը',
    }
};

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
    const [items, setItems] = useState<WishItem[]>([]);

    // Global Settings State
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [lang, setLang] = useState<Language>('ru');
    const [globalCurrency, setGlobalCurrency] = useState('₽');

    // Navigation and Sort State
    const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('none');

    // Modal Temporary Settings
    const [tempIsDarkMode, setTempIsDarkMode] = useState(isDarkMode);
    const [tempLang, setTempLang] = useState<Language>(lang);
    const [tempCurrency, setTempCurrency] = useState(globalCurrency);

    // Modals Visibility
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const [isSortVisible, setSortVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<WishItem | null>(null);

    const t = TRANSLATIONS[lang];

    const getCategoryName = (key: string) => {
        const trKey = `cat_${key}` as keyof typeof t;
        return t[trKey] || key;
    };

    const MAIN_CATEGORIES = [
        { id: 'tech', icon: 'hardware-chip-outline' as const, bgColor: '#E8AEB7' },
        { id: 'sport', icon: 'football-outline' as const, bgColor: '#B8E0D2' },
        { id: 'games', icon: 'game-controller-outline' as const, bgColor: '#D6C7FF' },
        { id: 'all', icon: 'grid-outline' as const, bgColor: '#F7D6C8' },
    ];

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
    };

    // Form Inputs State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [categoryKey, setCategoryKey] = useState<string>(CATEGORY_KEYS[0]);
    const [imageUri, setImageUri] = useState('');
    const [link, setLink] = useState('');
    const [notes, setNotes] = useState('');

    const openSettings = () => {
        setTempIsDarkMode(isDarkMode);
        setTempLang(lang);
        setTempCurrency(globalCurrency);
        setSettingsVisible(true);
    };

    const handleSaveSettings = () => {
        setIsDarkMode(tempIsDarkMode);
        setLang(tempLang);
        setGlobalCurrency(tempCurrency);
        setSettingsVisible(false);
    };

    const extractPriceValue = (priceStr?: string): number => {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    };

    const openEditModal = (item?: WishItem) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setPrice(item.price ? item.price.replace(/[^0-9.]/g, '') : '');
            setCategoryKey(item.category || CATEGORY_KEYS[0]);
            setImageUri(item.imageUri || '');
            setLink(item.link || '');
            setNotes(item.notes || '');
        } else {
            setEditingItem(null);
            setTitle('');
            setPrice('');
            setCategoryKey(CATEGORY_KEYS[0]);
            setImageUri('');
            setLink('');
            setNotes('');
        }
        setEditModalVisible(true);
    };

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
                        ? { ...item, title, price: formattedPrice, category: categoryKey, imageUri, link, notes }
                        : item
                )
            );
        } else {
            const newItem: WishItem = {
                id: Date.now().toString(),
                title,
                price: formattedPrice,
                category: categoryKey,
                imageUri,
                link,
                notes,
                isCompleted: false,
                isArchived: false,
            };
            setItems((prev) => [newItem, ...prev]);
        }

        setEditModalVisible(false);
    };

    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setEditModalVisible(false);
    };

    const handleArchiveToggle = (id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isArchived: !item.isArchived } : item
            )
        );
        setEditModalVisible(false);
    };

    const toggleComplete = (id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
            )
        );
    };

    // --- Main List Component ---
    const WishList = ({ type }: { type: 'active' | 'completed' | 'archived' }) => {
        let filteredData = items.filter((i) => {
            if (type === 'archived') return i.isArchived === true;
            if (type === 'completed') return i.isCompleted === true && !i.isArchived;
            return !i.isCompleted && !i.isArchived;
        });

        const activeTotalItems = items.filter((i) => !i.isCompleted && !i.isArchived).length;

        // Отдельный экран подкатегории (когда кликнули на категорию)
        if (type === 'active' && activeCategoryKey) {
            const categoryItems = activeCategoryKey === 'all'
                ? filteredData
                : filteredData.filter((i) => i.category === activeCategoryKey);

            if (sortOption === 'price-asc') {
                categoryItems.sort((a, b) => extractPriceValue(a.price) - extractPriceValue(b.price));
            } else if (sortOption === 'price-desc') {
                categoryItems.sort((a, b) => extractPriceValue(b.price) - extractPriceValue(a.price));
            }

            const categoryTotalPrice = categoryItems.reduce((sum, item) => sum + extractPriceValue(item.price), 0);

            return (
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    <View style={styles.categoryHeader}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setActiveCategoryKey(null)}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                            <Text style={[styles.backButtonText, { color: theme.text }]}>{t.backBtn}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.categoryPageTitle, { color: theme.text }]}>
                            {getCategoryName(activeCategoryKey)}
                        </Text>
                    </View>

                    {categoryItems.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconBg, { backgroundColor: theme.inputBg }]}>
                                <Ionicons name="folder-open-outline" size={50} color={theme.subText} />
                            </View>
                            <Text style={[styles.emptyTitleText, { color: theme.text }]}>{t.emptyCategory}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={categoryItems}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingBottom: 140 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => openEditModal(item)}
                                >
                                    <TouchableOpacity style={styles.radioContainer} onPress={() => toggleComplete(item.id)}>
                                        <Ionicons name="ellipse-outline" size={24} color={theme.subText} />
                                    </TouchableOpacity>
                                    <Image source={{ uri: item.imageUri || DEFAULT_IMAGE }} style={styles.cardImage} />
                                    <View style={styles.cardContent}>
                                        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        {item.category && (
                                            <Text style={[styles.categoryBadgeText, { color: theme.primary }]}>
                                                {getCategoryName(item.category)}
                                            </Text>
                                        )}
                                        {item.link ? (
                                            <TouchableOpacity onPress={() => Linking.openURL(item.link!)} style={styles.linkBadge}>
                                                <Ionicons name="link-outline" size={12} color={theme.primary} />
                                                <Text style={[styles.linkText, { color: theme.primary }]} numberOfLines={1}>
                                                    {t.linkText}
                                                </Text>
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                    {item.price && (
                                        <View style={[styles.priceBadge, { backgroundColor: theme.badgeBg }]}>
                                            <Text style={[styles.price, { color: theme.accentGreen }]}>{item.price}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    {/* Подсчёт общей стоимости в категории внизу */}
                    <View style={[styles.totalSumFooter, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.totalSumLabel, { color: theme.subText }]}>{t.totalPrice}</Text>
                        <Text style={[styles.totalSumValue, { color: theme.accentGreen }]}>
                            {categoryTotalPrice} {globalCurrency}
                        </Text>
                    </View>
                </View>
            );
        }

        if (type === 'active' && activeTotalItems === 0) {
            return (
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconBg, { backgroundColor: theme.inputBg }]}>
                            <Ionicons name="add-circle-outline" size={60} color={theme.primary} />
                        </View>
                        <Text style={[styles.emptyTitleText, { color: theme.text }]}>{t.emptyWishlist}</Text>
                        <Text style={[styles.emptySubText, { color: theme.subText }]}>{t.emptyWishlistSub}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: theme.primary }]}
                        activeOpacity={0.85}
                        onPress={() => openEditModal()}
                    >
                        <Ionicons name="add" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            );
        }

        if (sortOption === 'price-asc') {
            filteredData.sort((a, b) => extractPriceValue(a.price) - extractPriceValue(b.price));
        } else if (sortOption === 'price-desc') {
            filteredData.sort((a, b) => extractPriceValue(b.price) - extractPriceValue(a.price));
        }

        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
                    ListHeaderComponent={
                        type === 'active' ? (
                            <View>
                                {/* Кнопка сортировки переместилась прямо в блок категорий */}
                                <View style={styles.categoryHeaderRow}>
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.categoriesTitle}</Text>
                                    <TouchableOpacity style={styles.sortButtonInCategories} onPress={() => setSortVisible(true)}>
                                        <Ionicons name="options-outline" size={18} color={theme.primary} />
                                        <Text style={[styles.sortButtonText, { color: theme.primary }]}>
                                            {sortOption === 'none' ? t.sortTitle : sortOption === 'price-asc' ? t.sortCheap : t.sortExpensive}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.categoriesGrid}>
                                    {MAIN_CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            activeOpacity={0.8}
                                            style={[styles.categoryCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                            onPress={() => setActiveCategoryKey(cat.id)}
                                        >
                                            <View style={[styles.iconCircle, { backgroundColor: cat.bgColor }]}>
                                                <Ionicons name={cat.icon} size={26} color="#333" />
                                            </View>
                                            <Text style={[styles.categoryCardTitle, { color: theme.text }]}>
                                                {getCategoryName(cat.id)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 16, marginTop: 12, marginBottom: 8 }]}>
                                    {t.recentlyAdded}
                                </Text>
                            </View>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                            activeOpacity={0.8}
                            onPress={() => openEditModal(item)}
                        >
                            <TouchableOpacity
                                style={styles.radioContainer}
                                onPress={() => (type === 'archived' ? handleArchiveToggle(item.id) : toggleComplete(item.id))}
                            >
                                <Ionicons
                                    name={type === 'archived' ? 'archive-outline' : item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={24}
                                    color={type === 'archived' ? theme.primary : item.isCompleted ? theme.accentGreen : theme.subText}
                                />
                            </TouchableOpacity>

                            <Image source={{ uri: item.imageUri || DEFAULT_IMAGE }} style={styles.cardImage} />

                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                {item.category ? (
                                    <Text style={[styles.categoryBadgeText, { color: theme.primary }]}>
                                        {getCategoryName(item.category)}
                                    </Text>
                                ) : null}
                                {item.link ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(item.link!)} style={styles.linkBadge}>
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
                        type !== 'active' ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptySubText, { color: theme.subText }]}>
                                    {type === 'archived' ? t.emptyArchive : t.emptyCompleted}
                                </Text>
                            </View>
                        ) : null
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

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, focused }) => {
                        let iconName: keyof typeof Ionicons.glyphMap = 'gift-outline';
                        if (route.name === 'Wishlist') iconName = focused ? 'gift' : 'gift-outline';
                        else if (route.name === 'Archived') iconName = focused ? 'archive' : 'archive-outline';
                        else if (route.name === 'Completed') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.subText,
                    tabBarStyle: { backgroundColor: theme.tabBg, borderTopColor: theme.border, height: 68, paddingBottom: 12, paddingTop: 8 },
                    headerStyle: { backgroundColor: theme.headerBg },
                    headerTitleStyle: { color: theme.text, fontWeight: '700', fontSize: 20 },
                    headerTitleAlign: 'center',
                    headerLeft: () => (
                        <TouchableOpacity onPress={openSettings} style={{ marginLeft: 16 }}>
                            <Ionicons name="settings-outline" size={22} color={theme.text} />
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

            {/* --- Sort Modal --- */}
            <Modal visible={isSortVisible} animationType="slide" transparent onRequestClose={() => setSortVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortVisible(false)}>
                    <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.handleBar} />
                        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{t.sortTitle}</Text>
                            <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.sortPriceLabel}</Text>

                            {(['none', 'price-asc', 'price-desc'] as SortOption[]).map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.categoryOption, { backgroundColor: theme.inputBg }, sortOption === opt && { borderColor: theme.primary, borderWidth: 1 }]}
                                    onPress={() => setSortOption(opt)}
                                >
                                    <Text style={[styles.categoryOptionText, { color: theme.text }]}>
                                        {opt === 'none' ? t.sortNone : opt === 'price-asc' ? t.sortCheap : t.sortExpensive}
                                    </Text>
                                    {sortOption === opt && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary, marginTop: 20 }]} onPress={() => setSortVisible(false)}>
                                <Text style={[styles.btnText, { color: '#FFF' }]}>{t.close}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* --- Settings Modal --- */}
            <Modal visible={isSettingsVisible} animationType="slide" transparent onRequestClose={() => setSettingsVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSettingsVisible(false)}>
                    <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.handleBar} />
                        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{t.settingsTitle}</Text>

                            <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.themeLabel}</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                                <TouchableOpacity style={[styles.chip, { flex: 1, backgroundColor: !tempIsDarkMode ? theme.primary : theme.inputBg }]} onPress={() => setTempIsDarkMode(false)}>
                                    <Text style={{ color: !tempIsDarkMode ? '#FFF' : theme.text, textAlign: 'center' }}>{t.themeLight}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.chip, { flex: 1, backgroundColor: tempIsDarkMode ? theme.primary : theme.inputBg }]} onPress={() => setTempIsDarkMode(true)}>
                                    <Text style={{ color: tempIsDarkMode ? '#FFF' : theme.text, textAlign: 'center' }}>{t.themeDark}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.langLabel}</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                {[
                                    { code: 'ru', label: 'Русский' },
                                    { code: 'en', label: 'English' },
                                    { code: 'hy', label: 'Հայերեն' },
                                ].map((l) => (
                                    <TouchableOpacity
                                        key={l.code}
                                        style={[styles.chip, { flex: 1, backgroundColor: tempLang === l.code ? theme.primary : theme.inputBg }]}
                                        onPress={() => setTempLang(l.code as Language)}
                                    >
                                        <Text style={{ color: tempLang === l.code ? '#FFF' : theme.text, textAlign: 'center' }}>{l.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.currencyLabel}</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                {CURRENCIES.map((c) => (
                                    <TouchableOpacity key={c} style={[styles.chip, { backgroundColor: tempCurrency === c ? theme.primary : theme.inputBg, paddingHorizontal: 16 }]} onPress={() => setTempCurrency(c)}>
                                        <Text style={{ color: tempCurrency === c ? '#FFF' : theme.text }}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleSaveSettings}>
                                <Text style={[styles.btnText, { color: '#FFF' }]}>{t.saveSettings}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* --- Edit & Add Modal (Все поля и кнопки на месте) --- */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditModalVisible(false)}>
                        <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.handleBar} />
                            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>{editingItem ? t.editWish : t.newWish}</Text>

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.titleLabel}</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]} placeholder={t.titlePlaceholder} placeholderTextColor={theme.subText} value={title} onChangeText={setTitle} />

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.priceLabel}</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]} placeholder={t.pricePlaceholder} placeholderTextColor={theme.subText} keyboardType="numeric" value={price} onChangeText={setPrice} />

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.categoryLabel}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                    {CATEGORY_KEYS.map((catKey) => (
                                        <TouchableOpacity key={catKey} style={[styles.chip, { backgroundColor: categoryKey === catKey ? theme.primary : theme.inputBg }]} onPress={() => setCategoryKey(catKey)}>
                                            <Text style={{ color: categoryKey === catKey ? '#FFF' : theme.text, fontWeight: '600' }}>{getCategoryName(catKey)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.photoLabel}</Text>
                                <TouchableOpacity style={[styles.photoPickerBtn, { backgroundColor: theme.inputBg }]} onPress={pickImage}>
                                    <Ionicons name="camera-outline" size={20} color={theme.primary} />
                                    <Text style={{ color: theme.primary, marginLeft: 8, fontWeight: '600' }}>{imageUri ? t.changePhoto : t.pickPhoto}</Text>
                                </TouchableOpacity>

                                {/* ВОССТАНОВЛЕННАЯ ССЫЛКА */}
                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.linkLabel}</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]} placeholder="https://..." placeholderTextColor={theme.subText} value={link} onChangeText={setLink} />

                                {/* ВОССТАНОВЛЕННЫЕ ЗАМЕТКИ */}
                                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.notesLabel}</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, height: 70 }]} placeholder={t.notesPlaceholder} placeholderTextColor={theme.subText} multiline value={notes} onChangeText={setNotes} />

                                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary, marginTop: 12 }]} onPress={handleSave}>
                                    <Text style={[styles.btnText, { color: '#FFF' }]}>{editingItem ? t.update : t.save}</Text>
                                </TouchableOpacity>

                                {/* ВОССТАНОВЛЕННЫЕ КНОПКИ УДАЛЕНИЯ И АРХИВА */}
                                {editingItem && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                        <TouchableOpacity style={[styles.btn, { flex: 0.48, backgroundColor: theme.inputBg }]} onPress={() => handleArchiveToggle(editingItem.id)}>
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>
                                                {editingItem.isArchived ? t.unarchive : t.archive}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.btn, { flex: 0.48, backgroundColor: 'rgba(255, 69, 58, 0.15)' }]} onPress={() => handleDelete(editingItem.id)}>
                                            <Text style={{ color: theme.accentRed, fontWeight: '600' }}>{t.delete}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    categoryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
    sortButtonInCategories: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(91, 103, 202, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    sortButtonText: { fontSize: 13, fontWeight: '600' },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, justifyContent: 'space-between' },
    categoryCard: { width: '48%', height: 95, borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, justifyContent: 'space-between', alignItems: 'flex-start' },
    iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    categoryCardTitle: { fontWeight: '700', fontSize: 14 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
    backButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
    categoryPageTitle: { fontSize: 20, fontWeight: '700' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, marginTop: 60 },
    emptyIconBg: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitleText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
    emptySubText: { fontSize: 14, textAlign: 'center' },
    card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 6, padding: 12, borderRadius: 16, borderWidth: 1 },
    radioContainer: { marginRight: 10 },
    cardImage: { width: 48, height: 48, borderRadius: 10, marginRight: 12 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '600' },
    categoryBadgeText: { fontSize: 12, marginTop: 2, fontWeight: '500' },
    linkBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    linkText: { fontSize: 12, marginLeft: 4 },
    priceBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    price: { fontWeight: '700', fontSize: 13 },
    fab: { position: 'absolute', bottom: 24, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    totalSumFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderTopLeftRadius: 18, borderTopRightRadius: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalSumLabel: { fontSize: 15, fontWeight: '600' },
    totalSumValue: { fontSize: 18, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12 },
    handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CCC', alignSelf: 'center', marginBottom: 12 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
    input: { padding: 12, borderRadius: 12, fontSize: 15, marginBottom: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8 },
    photoPickerBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, justifyContent: 'center', marginBottom: 8 },
    btn: { padding: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontWeight: '700', fontSize: 16 },
    categoryOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 12, marginBottom: 8 },
    categoryOptionText: { fontSize: 15, fontWeight: '500' },
});