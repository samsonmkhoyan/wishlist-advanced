import React, { useState, useMemo } from 'react';
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
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
const CATEGORY_KEYS = ['tech', 'clothes', 'games', 'sport', 'education', 'other'] as const;

const CATEGORY_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
    tech: { icon: 'laptop-outline', color: '#6366F1', bgColor: '#EEF2FF' },
    sport: { icon: 'football-outline', color: '#10B981', bgColor: '#ECFDF5' },
    games: { icon: 'game-controller-outline', color: '#8B5CF6', bgColor: '#F5F3FF' },
    clothes: { icon: 'shirt-outline', color: '#F97316', bgColor: '#FFF7ED' },
    education: { icon: 'school-outline', color: '#EC4899', bgColor: '#FDF2F8' },
    other: { icon: 'cube-outline', color: '#6B7280', bgColor: '#F3F4F6' },
    all: { icon: 'grid-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
};

const LANGUAGES: { label: string; code: Language }[] = [
    { label: 'Русский', code: 'ru' },
    { label: 'English', code: 'en' },
    { label: 'Հայերեն', code: 'hy' },
];

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
        emptyWishlist: 'Добавь свой первый предмет',
        emptyWishlistSub: 'Нажмите на плюсик ниже, чтобы добавить желание!',
        emptyCategory: 'В этой категории пока ничего нет',
        emptyCompleted: 'Пока нет исполненных желаний',
        emptyArchive: 'В архиве ничего нет',
        emptySearch: 'Ничего не найдено',
        errorTitle: 'Ошибка',
        errorTitleMsg: 'Пожалуйста, введите название!',
        errorPermission: 'Требуется разрешение на доступ к галерее!',
        linkText: 'Открыть ссылку',
        settingsTitle: 'Настройки',
        themeLabel: 'ТЕМА ОФОРМЛЕНИЯ',
        themeDark: 'Тёмная',
        themeLight: 'Светлая',
        langLabel: 'Язык',
        currencyLabel: 'Валюта',
        close: 'Закрыть',
        saveSettings: 'Сохранить',
        sortTitle: 'Сортировка',
        sortPriceLabel: 'Сортировка по цене',
        sortNone: 'Без сортировки',
        sortCheap: 'Сначала дешевые',
        sortExpensive: 'Сначала дорогие',
        recentlyAdded: 'Недавно добавленные',
        categoriesTitle: 'Категории',
        seeAll: 'Посмотреть все',
        allCategoriesTitle: 'Все категории',
        backBtn: 'Назад',
        totalPrice: 'Итого в категории:',
        cat_tech: 'Техника',
        cat_clothes: 'Одежда',
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
        emptySearch: 'No items found',
        errorTitle: 'Error',
        errorTitleMsg: 'Please enter a title!',
        errorPermission: 'Permission to access gallery is required!',
        linkText: 'Open link',
        settingsTitle: 'Settings',
        themeLabel: 'APP THEME',
        themeDark: 'Dark',
        themeLight: 'Light',
        langLabel: 'Language',
        currencyLabel: 'Currency',
        close: 'Close',
        saveSettings: 'Save',
        sortTitle: 'Sort',
        sortPriceLabel: 'Sort by Price',
        sortNone: 'Default',
        sortCheap: 'Cheapest first',
        sortExpensive: 'Most expensive first',
        recentlyAdded: 'Recently Added',
        categoriesTitle: 'Categories',
        seeAll: 'See All',
        allCategoriesTitle: 'All Categories',
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
        emptySearch: 'Ոչինչ չի գտնվել',
        errorTitle: 'Սխալ',
        errorTitleMsg: 'Խնդրում ենք մուտքագրել անվանումը:',
        errorPermission: 'Պահանջվում է պատկերասրահի հասանելիություն:',
        linkText: 'Բացել հղումը',
        settingsTitle: 'Կարգավորումներ',
        themeLabel: 'ԾՐԱԳՐԻ ՈՃԸ',
        themeDark: 'Մութ',
        themeLight: 'Լուսավոր',
        langLabel: 'Լեզուն',
        currencyLabel: 'Արժույթը',
        close: 'Փակել',
        saveSettings: 'Պահպանել',
        sortTitle: 'Տեսակավորում',
        sortPriceLabel: 'Տեսակավորում ըստ գնի',
        sortNone: 'Սկզբնական',
        sortCheap: 'Էժանները',
        sortExpensive: 'Թանկերը',
        recentlyAdded: 'Վերջին ավելացվածները',
        categoriesTitle: 'Կատեգորիաներ',
        seeAll: 'Տեսնել բոլորը',
        allCategoriesTitle: 'Բոլոր Կատեգորիաները',
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

export default function App() {
    const [items, setItems] = useState<WishItem[]>([]);
    const [currentScreen, setCurrentScreen] = useState<'main' | 'settings' | 'all-categories'>('main');
    const [searchQuery, setSearchQuery] = useState('');

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [lang, setLang] = useState<Language>('ru');
    const [globalCurrency, setGlobalCurrency] = useState('₽');

    const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('none');

    const [isLangModalOpen, setLangModalOpen] = useState(false);
    const [isCurrModalOpen, setCurrModalOpen] = useState(false);
    const [isSortVisible, setSortVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<WishItem | null>(null);

    const t = TRANSLATIONS[lang];

    const getCategoryName = (key: string) => {
        const trKey = `cat_${key}` as keyof typeof t;
        return t[trKey] || key;
    };

    const getCategoryColor = (key: string) => {
        return CATEGORY_CONFIG[key]?.color || '#6C5CE7';
    };

    const getTopCategories = () => {
        const activeItems = items.filter((i) => !i.isCompleted && !i.isArchived);
        const counts: Record<string, number> = {};

        CATEGORY_KEYS.forEach((k) => (counts[k] = 0));
        activeItems.forEach((i) => {
            if (i.category && counts[i.category] !== undefined) {
                counts[i.category] += 1;
            }
        });

        const sorted = [...CATEGORY_KEYS].sort((a, b) => counts[b] - counts[a]);
        return sorted.slice(0, 4);
    };

    const theme = {
        background: isDarkMode ? '#0F111A' : '#F4F5FA',
        card: isDarkMode ? '#181A26' : '#FFFFFF',
        text: isDarkMode ? '#F3F4F6' : '#111827',
        subText: isDarkMode ? '#9CA3AF' : '#6B7280',
        inputBg: isDarkMode ? '#222536' : '#F3F4F6',
        tabBg: isDarkMode ? '#181A26' : '#FFFFFF',
        border: isDarkMode ? '#282B3D' : '#E5E7EB',
        primary: '#6C5CE7',
        accentGreen: '#10B981',
        accentRed: '#EF4444',
        badgeBg: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    };

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [categoryKey, setCategoryKey] = useState<string>(CATEGORY_KEYS[0]);
    const [imageUri, setImageUri] = useState('');
    const [link, setLink] = useState('');
    const [notes, setNotes] = useState('');

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

    const AllCategoriesPage = () => (
        <SafeAreaView style={[styles.settingsContainer, { backgroundColor: theme.background }]}>
            <View style={styles.settingsHeader}>
                <TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnHeader} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={26} color={theme.text} />
                    <Text style={[styles.backBtnLabel, { color: theme.text }]}>{t.backBtn}</Text>
                </TouchableOpacity>
                <Text style={[styles.settingsTitleText, { color: theme.text }]}>{t.allCategoriesTitle}</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {['all', ...CATEGORY_KEYS].map((catKey) => {
                    const cfg = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG['other'];
                    return (
                        <TouchableOpacity
                            key={catKey}
                            style={[styles.fullCategoryRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                            activeOpacity={0.8}
                            onPress={() => {
                                setActiveCategoryKey(catKey);
                                setCurrentScreen('main');
                            }}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: cfg.bgColor }]}>
                                <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                            </View>
                            <Text style={[styles.categoryCardTitle, { color: cfg.color, fontSize: 16 }]}>
                                {getCategoryName(catKey)}
                            </Text>
                            <Ionicons name="chevron-forward" size={18} color={theme.subText} />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );

    const SettingsPage = () => (
        <SafeAreaView style={[styles.settingsContainer, { backgroundColor: theme.background }]}>
            <View style={styles.settingsHeader}>
                <TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnHeader} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={26} color={theme.text} />
                    <Text style={[styles.backBtnLabel, { color: theme.text }]}>{t.backBtn}</Text>
                </TouchableOpacity>
                <Text style={[styles.settingsTitleText, { color: theme.text }]}>{t.settingsTitle}</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={[styles.sectionLabel, { color: theme.subText }]}>{t.themeLabel}</Text>
                <View style={[styles.segmentedControlContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.segmentBtn,
                            !isDarkMode && { backgroundColor: theme.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setIsDarkMode(false)}
                    >
                        <Ionicons name="sunny" size={18} color={!isDarkMode ? '#F59E0B' : theme.subText} />
                        <Text style={[styles.segmentBtnText, { color: !isDarkMode ? theme.text : theme.subText, fontWeight: !isDarkMode ? '700' : '500' }]}>
                            {t.themeLight}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.segmentBtn,
                            isDarkMode && { backgroundColor: theme.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setIsDarkMode(true)}
                    >
                        <Ionicons name="moon" size={18} color={isDarkMode ? '#A78BFA' : theme.subText} />
                        <Text style={[styles.segmentBtnText, { color: isDarkMode ? theme.text : theme.subText, fontWeight: isDarkMode ? '700' : '500' }]}>
                            {t.themeDark}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.settingsRowGrid}>
                    <TouchableOpacity
                        style={[styles.gridSquareBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                        activeOpacity={0.8}
                        onPress={() => setLangModalOpen(true)}
                    >
                        <View style={[styles.gridIconCircle, { backgroundColor: '#EEF2FF' }]}>
                            <Ionicons name="language" size={24} color="#6C5CE7" />
                        </View>
                        <Text style={[styles.gridBtnLabel, { color: theme.subText }]}>{t.langLabel}</Text>
                        <Text style={[styles.gridBtnValue, { color: theme.text }]}>
                            {LANGUAGES.find((l) => l.code === lang)?.label}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.gridSquareBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                        activeOpacity={0.8}
                        onPress={() => setCurrModalOpen(true)}
                    >
                        <View style={[styles.gridIconCircle, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="cash" size={24} color="#10B981" />
                        </View>
                        <Text style={[styles.gridBtnLabel, { color: theme.subText }]}>{t.currencyLabel}</Text>
                        <Text style={[styles.gridBtnValue, { color: theme.text }]}>{globalCurrency}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={isLangModalOpen} transparent animationType="fade" onRequestClose={() => setLangModalOpen(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangModalOpen(false)}>
                    <View style={[styles.quickModalBox, { backgroundColor: theme.card }]}>
                        <Text style={[styles.quickModalTitle, { color: theme.text }]}>{t.langLabel}</Text>
                        {LANGUAGES.map((l) => (
                            <TouchableOpacity
                                key={l.code}
                                style={[styles.modalOptionRow, { borderBottomColor: theme.border }]}
                                onPress={() => {
                                    setLang(l.code);
                                    setLangModalOpen(false);
                                }}
                            >
                                <Text style={[styles.optionText, { color: theme.text }]}>{l.label}</Text>
                                {lang === l.code && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={isCurrModalOpen} transparent animationType="fade" onRequestClose={() => setCurrModalOpen(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCurrModalOpen(false)}>
                    <View style={[styles.quickModalBox, { backgroundColor: theme.card }]}>
                        <Text style={[styles.quickModalTitle, { color: theme.text }]}>{t.currencyLabel}</Text>
                        <View style={styles.currencyGrid}>
                            {CURRENCIES.map((c) => (
                                <TouchableOpacity
                                    key={c}
                                    style={[
                                        styles.currencyBadge,
                                        { backgroundColor: globalCurrency === c ? theme.primary : theme.inputBg },
                                    ]}
                                    onPress={() => {
                                        setGlobalCurrency(c);
                                        setCurrModalOpen(false);
                                    }}
                                >
                                    <Text style={[styles.currencyText, { color: globalCurrency === c ? '#FFF' : theme.text }]}>
                                        {c}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );

    const renderWishListScreen = (type: 'active' | 'completed' | 'archived') => {
        let filteredData = items.filter((i) => {
            if (type === 'archived') return i.isArchived === true;
            if (type === 'completed') return i.isCompleted === true && !i.isArchived;
            return !i.isCompleted && !i.isArchived;
        });

        if (searchQuery.trim()) {
            filteredData = filteredData.filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
            );
        }

        const activeTotalItems = items.filter((i) => !i.isCompleted && !i.isArchived).length;

        if (type === 'active' && activeCategoryKey) {
            let categoryItems = activeCategoryKey === 'all'
                ? filteredData
                : filteredData.filter((i) => i.category === activeCategoryKey);

            if (sortOption === 'price-asc') {
                categoryItems.sort((a, b) => extractPriceValue(a.price) - extractPriceValue(b.price));
            } else if (sortOption === 'price-desc') {
                categoryItems.sort((a, b) => extractPriceValue(b.price) - extractPriceValue(a.price));
            }

            const categoryTotalPrice = categoryItems.reduce((sum, item) => sum + extractPriceValue(item.price), 0);

            return (
                <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                    <View style={styles.categoryHeader}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setActiveCategoryKey(null)}>
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                            <Text style={[styles.backButtonText, { color: theme.text }]}>{t.backBtn}</Text>
                        </TouchableOpacity>

                        <Text style={[styles.categoryPageTitle, { color: getCategoryColor(activeCategoryKey) }]} numberOfLines={1}>
                            {getCategoryName(activeCategoryKey)}
                        </Text>

                        <TouchableOpacity style={styles.sortBtnInsideCategory} onPress={() => setSortVisible(true)}>
                            <Ionicons name="swap-vertical" size={18} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    {categoryItems.length === 0 ? (
                        <View style={styles.emptyContainerCentered}>
                            <View style={[styles.emptyIconBg, { backgroundColor: theme.inputBg }]}>
                                <Ionicons name="folder-open-outline" size={46} color={theme.subText} />
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
                                    activeOpacity={0.85}
                                    onPress={() => openEditModal(item)}
                                >
                                    <TouchableOpacity style={styles.radioContainer} onPress={() => toggleComplete(item.id)}>
                                        <Ionicons name="ellipse-outline" size={22} color={theme.subText} />
                                    </TouchableOpacity>
                                    <Image source={{ uri: item.imageUri || DEFAULT_IMAGE }} style={styles.cardImage} />
                                    <View style={styles.cardContent}>
                                        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        {item.category && (
                                            <Text style={[styles.categoryBadgeText, { color: getCategoryColor(item.category) }]}>
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

                    <View style={[styles.totalSumFooter, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.totalSumLabel, { color: theme.subText }]}>{t.totalPrice}</Text>
                        <Text style={[styles.totalSumValue, { color: theme.accentGreen }]}>
                            {categoryTotalPrice} {globalCurrency}
                        </Text>
                    </View>
                </SafeAreaView>
            );
        }

        if (type === 'active' && activeTotalItems === 0 && !searchQuery.trim()) {
            return (
                <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                    <View style={styles.topHeaderSection}>
                        <View style={styles.headerTopRow}>
                            <View />
                            <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={styles.settingsIconBtn} activeOpacity={0.7}>
                                <Ionicons name="settings-outline" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.mainAppTitle, { color: theme.text }]}>Wishlist</Text>
                        <View style={[styles.searchBarContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Search your wishlist..."
                                placeholderTextColor={theme.subText}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                            />
                            <Ionicons name="search-outline" size={20} color={theme.subText} style={{ marginLeft: 8 }} />
                        </View>
                    </View>

                    <View style={styles.emptyContainerCentered}>
                        <View style={styles.giftBoxWrapper}>
                            <View style={[styles.giftLid, { backgroundColor: theme.primary }]}>
                                <Ionicons name="ribbon-outline" size={28} color="#FFF" />
                            </View>
                            <View style={[styles.giftBody, { backgroundColor: theme.primary }]}>
                                <Ionicons name="sparkles" size={32} color="#FBBF24" />
                            </View>
                        </View>

                        <Text style={[styles.emptyTitleText, { color: theme.text }]}>{t.emptyWishlist}</Text>
                        <Text style={[styles.emptySubText, { color: theme.subText }]}>{t.emptyWishlistSub}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: theme.primary }]}
                        activeOpacity={0.85}
                        onPress={() => openEditModal()}
                    >
                        <Ionicons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                </SafeAreaView>
            );
        }

        if (sortOption === 'price-asc') {
            filteredData.sort((a, b) => extractPriceValue(a.price) - extractPriceValue(b.price));
        } else if (sortOption === 'price-desc') {
            filteredData.sort((a, b) => extractPriceValue(b.price) - extractPriceValue(a.price));
        }

        const topCategories = getTopCategories();

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                {type === 'active' && (
                    <View style={styles.topHeaderSection}>
                        <View style={styles.headerTopRow}>
                            <View />
                            <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={styles.settingsIconBtn} activeOpacity={0.7}>
                                <Ionicons name="settings-outline" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.mainAppTitle, { color: theme.text }]}>Wishlist</Text>
                        <View style={[styles.searchBarContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Search your wishlist..."
                                placeholderTextColor={theme.subText}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                            />
                            <Ionicons name="search-outline" size={20} color={theme.subText} style={{ marginLeft: 8 }} />
                        </View>
                    </View>
                )}

                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    ListHeaderComponent={
                        type === 'active' && !searchQuery.trim() ? (
                            <View>
                                <View style={styles.categoryHeaderRow}>
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.categoriesTitle}</Text>
                                    <TouchableOpacity style={styles.seeAllButton} onPress={() => setCurrentScreen('all-categories')}>
                                        <Text style={[styles.seeAllText, { color: theme.primary }]}>{t.seeAll}</Text>
                                        <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.categoriesGrid}>
                                    {topCategories.map((catKey) => {
                                        const cfg = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG['other'];
                                        return (
                                            <TouchableOpacity
                                                key={catKey}
                                                activeOpacity={0.8}
                                                style={[styles.categoryCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                                onPress={() => setActiveCategoryKey(catKey)}
                                            >
                                                <View style={[styles.iconCircle, { backgroundColor: cfg.bgColor }]}>
                                                    <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                                                </View>
                                                <Text style={[styles.categoryCardTitle, { color: cfg.color }]}>
                                                    {getCategoryName(catKey)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 16, marginTop: 16, marginBottom: 8 }]}>
                                    {t.recentlyAdded}
                                </Text>
                            </View>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                            activeOpacity={0.85}
                            onPress={() => openEditModal(item)}
                        >
                            <TouchableOpacity
                                style={styles.radioContainer}
                                onPress={() => (type === 'archived' ? handleArchiveToggle(item.id) : toggleComplete(item.id))}
                            >
                                <Ionicons
                                    name={type === 'archived' ? 'archive-outline' : item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={22}
                                    color={type === 'archived' ? theme.primary : item.isCompleted ? theme.accentGreen : theme.subText}
                                />
                            </TouchableOpacity>

                            <Image source={{ uri: item.imageUri || DEFAULT_IMAGE }} style={styles.cardImage} />

                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                {item.category ? (
                                    <Text style={[styles.categoryBadgeText, { color: getCategoryColor(item.category) }]}>
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
                        <View style={styles.emptyContainerCentered}>
                            <Text style={[styles.emptySubText, { color: theme.subText }]}>
                                {searchQuery.trim()
                                    ? t.emptySearch
                                    : type === 'archived'
                                        ? t.emptyArchive
                                        : t.emptyCompleted}
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
                        <Ionicons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        );
    };

    if (currentScreen === 'settings') {
        return <SettingsPage />;
    }

    if (currentScreen === 'all-categories') {
        return <AllCategoriesPage />;
    }

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    animation: 'fade',
                    tabBarIcon: ({ color, focused }) => {
                        let iconName: keyof typeof Ionicons.glyphMap = 'gift-outline';
                        if (route.name === 'WishlistTab') iconName = focused ? 'gift' : 'gift-outline';
                        else if (route.name === 'ArchivedTab') iconName = focused ? 'archive' : 'archive-outline';
                        else if (route.name === 'CompletedTab') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                        return <Ionicons name={iconName} size={22} color={color} />;
                    },
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.subText,
                    tabBarStyle: {
                        backgroundColor: theme.tabBg,
                        borderTopColor: theme.border,
                        height: 64,
                        paddingBottom: 10,
                        paddingTop: 8,
                    },
                })}
            >
                <Tab.Screen name="WishlistTab" options={{ title: t.wishlistTab, headerShown: false }}>
                    {() => renderWishListScreen('active')}
                </Tab.Screen>
                <Tab.Screen name="ArchivedTab" options={{ title: t.archiveTab, headerShown: false }}>
                    {() => renderWishListScreen('archived')}
                </Tab.Screen>
                <Tab.Screen name="CompletedTab" options={{ title: t.completedTab, headerShown: false }}>
                    {() => renderWishListScreen('completed')}
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
                                    onPress={() => {
                                        setSortOption(opt);
                                        setSortVisible(false);
                                    }}
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

            {/* --- Add / Edit Wish Modal --- */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditModalVisible(false)}>
                        <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.handleBar} />
                            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>{editingItem ? t.editWish : t.newWish}</Text>

                                <Text style={[styles.inputLabel, { color: theme.subText }]}>{t.titleLabel}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                                    placeholder={t.titlePlaceholder}
                                    placeholderTextColor={theme.subText}
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <Text style={[styles.inputLabel, { color: theme.subText }]}>{t.priceLabel}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                                    placeholder={t.pricePlaceholder}
                                    placeholderTextColor={theme.subText}
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                />

                                <Text style={[styles.inputLabel, { color: theme.subText }]}>{t.categoryLabel}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                    {CATEGORY_KEYS.map((catKey) => {
                                        const catColor = getCategoryColor(catKey);
                                        const isSelected = categoryKey === catKey;
                                        return (
                                            <TouchableOpacity
                                                key={catKey}
                                                style={[
                                                    styles.catChip,
                                                    { backgroundColor: isSelected ? catColor : theme.inputBg },
                                                ]}
                                                onPress={() => setCategoryKey(catKey)}
                                            >
                                                <Text style={[styles.catChipText, { color: isSelected ? '#FFF' : theme.text }]}>
                                                    {getCategoryName(catKey)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <Text style={[styles.inputLabel, { color: theme.subText }]}>{t.photoLabel}</Text>
                                <TouchableOpacity style={[styles.photoPickerBtn, { backgroundColor: theme.inputBg }]} onPress={pickImage}>
                                    <Ionicons name="image-outline" size={20} color={theme.primary} />
                                    <Text style={[styles.photoPickerText, { color: theme.primary }]}>
                                        {imageUri ? t.changePhoto : t.pickPhoto}
                                    </Text>
                                </TouchableOpacity>
                                {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}

                                <Text style={[styles.inputLabel, { color: theme.subText }]}>{t.linkLabel}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                                    placeholder="https://..."
                                    placeholderTextColor={theme.subText}
                                    value={link}
                                    onChangeText={setLink}
                                />

                                <Text style={[styles.inputLabel, { color: theme.subText }]}>{t.notesLabel}</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, color: theme.text }]}
                                    placeholder={t.notesPlaceholder}
                                    placeholderTextColor={theme.subText}
                                    multiline
                                    numberOfLines={3}
                                    value={notes}
                                    onChangeText={setNotes}
                                />

                                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleSave}>
                                    <Text style={[styles.btnText, { color: '#FFF' }]}>{editingItem ? t.update : t.save}</Text>
                                </TouchableOpacity>

                                {editingItem && (
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={[styles.btnHalf, { backgroundColor: theme.inputBg }]}
                                            onPress={() => handleArchiveToggle(editingItem.id)}
                                        >
                                            <Text style={[styles.btnText, { color: theme.text }]}>
                                                {editingItem.isArchived ? t.unarchive : t.archive}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.btnHalf, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}
                                            onPress={() => handleDelete(editingItem.id)}
                                        >
                                            <Text style={[styles.btnText, { color: theme.accentRed }]}>{t.delete}</Text>
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

    topHeaderSection: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingsIconBtn: {
        padding: 4,
    },
    mainAppTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: 2,
        marginBottom: 10,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 46,
        width: '100%',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        height: '100%',
    },

    settingsContainer: { flex: 1 },
    settingsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtnHeader: { flexDirection: 'row', alignItems: 'center' },
    backBtnLabel: { fontSize: 16, marginLeft: 2, fontWeight: '600' },
    settingsTitleText: { fontSize: 18, fontWeight: '700' },
    sectionLabel: { fontSize: 11, fontWeight: '700', marginBottom: 10, letterSpacing: 0.8 },

    fullCategoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 10,
    },

    segmentedControlContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    segmentBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    segmentBtnText: { fontSize: 14 },

    settingsRowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    gridSquareBtn: {
        width: (width - 52) / 2,
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    gridIconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    gridBtnLabel: { fontSize: 12, marginBottom: 4 },
    gridBtnValue: { fontSize: 16, fontWeight: '700' },

    quickModalBox: { width: '80%', borderRadius: 24, padding: 20 },
    quickModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
    optionText: { fontSize: 16, fontWeight: '500' },
    currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    currencyBadge: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
    currencyText: { fontSize: 17, fontWeight: 'bold' },

    categoryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginVertical: 8 },
    sectionTitle: { fontSize: 17, fontWeight: '700' },
    seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    seeAllText: { fontSize: 13, fontWeight: '600' },

    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
    categoryCard: {
        width: (width - 44) / 2,
        margin: 6,
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    categoryCardTitle: { fontSize: 14, fontWeight: '700', flex: 1 },

    emptyContainerCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, minHeight: 300 },
    giftBoxWrapper: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    giftLid: {
        width: 76,
        height: 22,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-16deg' }, { translateY: -8 }],
        zIndex: 2,
    },
    giftBody: {
        width: 70,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -6,
    },
    emptyTitleText: { fontSize: 19, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
    emptySubText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 5,
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
    },
    radioContainer: { paddingRight: 10 },
    cardImage: { width: 48, height: 48, borderRadius: 12, marginRight: 12 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '600' },
    categoryBadgeText: { fontSize: 12, fontWeight: '700', marginTop: 2 },
    linkBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 },
    linkText: { fontSize: 12, fontWeight: '500' },
    priceBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    price: { fontSize: 13, fontWeight: '700' },

    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },

    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: { flexDirection: 'row', alignItems: 'center' },
    backButtonText: { fontSize: 15, marginLeft: 2, fontWeight: '500' },
    categoryPageTitle: { fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center', marginHorizontal: 8 },
    sortBtnInsideCategory: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

    totalSumFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalSumLabel: { fontSize: 14, fontWeight: '600' },
    totalSumValue: { fontSize: 18, fontWeight: '700' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', alignItems: 'center' },
    modalSheet: { width: '100%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, maxHeight: '85%' },
    handleBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 19, fontWeight: '700', marginBottom: 16 },
    inputLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
    input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 14 },
    textArea: { height: 75, textAlignVertical: 'top' },
    catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 8 },
    catChipText: { fontSize: 13, fontWeight: '700' },
    photoPickerBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 12, gap: 8 },
    photoPickerText: { fontWeight: '600' },
    previewImage: { width: '100%', height: 140, borderRadius: 14, marginBottom: 14 },
    btn: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    btnText: { fontSize: 15, fontWeight: '700' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 10 },
    btnHalf: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
    categoryOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 8 },
    categoryOptionText: { fontSize: 15, fontWeight: '500' },
});