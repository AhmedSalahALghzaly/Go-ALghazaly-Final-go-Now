import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/appStore';
import { favoritesApi } from '../services/api';
import { AnimatedFavoriteButton, AnimatedCartButton } from './AnimatedIconButton';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    name_ar: string;
    price: number;
    image_url?: string;
    product_brand_id?: string;
  };
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const router = useRouter();
  const { user } = useAppStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Check if product is in favorites when user is logged in
  useEffect(() => {
    const checkFavorite = async () => {
      if (user && product.id) {
        try {
          const response = await favoritesApi.check(product.id);
          setIsFavorite(response.data.is_favorite);
        } catch (error) {
          console.error('Error checking favorite:', error);
        }
      }
    };
    checkFavorite();
  }, [user, product.id]);

  const getName = () => {
    return language === 'ar' && product.name_ar ? product.name_ar : product.name;
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ج.م`;
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      const response = await favoritesApi.toggle(product.id);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    
    setCartLoading(true);
    setAddedToCart(true);
    
    try {
      await onAddToCart();
      // Reset added state after animation
      setTimeout(() => setAddedToCart(false), 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddedToCart(false);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {getName()}
        </Text>
        
        {/* Footer with Favorites button, Price, and Add to Cart button */}
        <View style={styles.footer}>
          {/* Animated Favorites Button - Left */}
          <AnimatedFavoriteButton
            isFavorite={isFavorite}
            isLoading={favoriteLoading}
            onPress={handleToggleFavorite}
            size={18}
            style={styles.iconButton}
          />
          
          {/* Price - Center */}
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(product.price)}
          </Text>
          
          {/* Animated Add to Cart Button - Right */}
          {onAddToCart && (
            <AnimatedCartButton
              isInCart={addedToCart}
              isLoading={cartLoading}
              onPress={handleAddToCart}
              size={18}
              primaryColor={colors.primary}
              style={styles.iconButton}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: 160,
    margin: 6,
  },
  imageContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    height: 36,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
