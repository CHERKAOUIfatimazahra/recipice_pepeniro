import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#FF6B35',
  secondary: '#2EC4B6',
  accent: '#FDCA40',
  dark: '#212529',
  grey: '#6C757D',
  lightGrey: '#E9ECEF',
  white: '#FFFFFF',
  error: '#DC3545',
  success: '#198754',
};

const ICONS = {
  heart: '♥',
  heartEmpty: '♡',
  star: '⭐',
  back: '←',
};

const windowWidth = Dimensions.get('window').width;

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favoriteRecipes');
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
          setFilteredFavorites(parsedFavorites);

          const uniqueCategories = [
            ...new Set(
              parsedFavorites
                .filter(recipe => recipe.strCategory || recipe.category)
                .map(recipe => recipe.strCategory || recipe.category),
            ),
          ];

          setCategories(['All', ...uniqueCategories]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    let results = favorites;

    if (searchTerm) {
      results = results.filter(recipe => {
        const title = recipe.strMeal || recipe.name || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (selectedCategory !== 'All') {
      results = results.filter(recipe => {
        const category = recipe.strCategory || recipe.category || '';
        return category === selectedCategory;
      });
    }

    setFilteredFavorites(results);
  }, [searchTerm, selectedCategory, favorites]);

  const isFavorite = recipe => {
    return favorites.some(
      fav =>
        (fav.idMeal && recipe.idMeal && fav.idMeal === recipe.idMeal) ||
        (fav.id && recipe.id && fav.id === recipe.id),
    );
  };

  const toggleFavorite = async recipe => {
    try {
      let updatedFavorites = [...favorites];

      if (isFavorite(recipe)) {
        updatedFavorites = updatedFavorites.filter(
          fav =>
            !(fav.idMeal && recipe.idMeal && fav.idMeal === recipe.idMeal) &&
            !(fav.id && recipe.id && fav.id === recipe.id),
        );
      } else {
        updatedFavorites.push(recipe);
      }

      await AsyncStorage.setItem(
        'favoriteRecipes',
        JSON.stringify(updatedFavorites),
      );
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
    }
  };

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipSelected,
      ]}
      onPress={() => setSelectedCategory(item)}>
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item && styles.categoryChipTextSelected,
        ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyText}>Aucun favori trouvé</Text>
      <Text style={styles.emptySubText}>
        Ajoutez des recettes à vos favoris depuis la page d'accueil
      </Text>
    </View>
  );

  const renderRecipeItem = ({item}) => (
    <TouchableOpacity
      style={styles.recipeCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('RecipeDetail', {recipe: item})}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: item.strMealThumb || item.imageUri}}
          style={styles.image}
        />

        {/* Badge catégorie */}
        {(item.strCategory || item.category) && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {(item.strCategory || item.category).length > 12
                ? (item.strCategory || item.category).substring(0, 10) + '...'
                : item.strCategory || item.category}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.recipeTitle}>
            {(item.strMeal || item.name).length > 24
              ? (item.strMeal || item.name).substring(0, 22) + '...'
              : item.strMeal || item.name}
          </Text>

          <View style={styles.metaInfo}>
            {(item.strArea || item.area) && (
              <Text style={styles.originText}>{item.strArea || item.area}</Text>
            )}
          </View>
        </View>

        {/* Bouton Favori */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite(item) && styles.favoriteActive,
          ]}
          onPress={() => toggleFavorite(item)}>
          <Text style={styles.favoriteButtonText}>
            {isFavorite(item) ? ICONS.heart : ICONS.heartEmpty}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
        translucent={false}
      />
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{ICONS.back}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mes Favoris</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Rechercher un favori..."
            placeholderTextColor={COLORS.grey}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Catégories horizontales */}
        {categories.length > 1 && (
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              keyExtractor={item => item}
              renderItem={renderCategoryItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Affichage des recettes */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Chargement des favoris...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFavorites}
            keyExtractor={item => item.idMeal || item.id}
            renderItem={renderRecipeItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyComponent}
            numColumns={1}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.dark,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 236, 239, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: COLORS.grey,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.dark,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(233, 236, 239, 0.75)',
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  categoryChipTextSelected: {
    color: COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.grey,
  },
  listContainer: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(46, 196, 182, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originText: {
    fontSize: 14,
    color: COLORS.grey,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(233, 236, 239, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: COLORS.error,
  },
  favoriteButtonText: {
    fontSize: 20,
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: 'center',
  },
});

export default FavoritesScreen;
