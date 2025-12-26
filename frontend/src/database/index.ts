/**
 * WatermelonDB Database Instance
 * Initializes the database with appropriate adapter for each platform
 */
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import { 
  CarBrand, 
  CarModel, 
  ProductBrand, 
  Category, 
  Product, 
  Favorite, 
  CartItem, 
  SyncMetadata 
} from './models';
import { Platform } from 'react-native';

// Create adapter based on platform
// Using LokiJS adapter which works on all platforms including web
const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: Platform.OS === 'web',
  dbName: 'alghazaly_offline_db',
});

// Create database instance with models
const database = new Database({
  adapter,
  modelClasses: [
    CarBrand,
    CarModel,
    ProductBrand,
    Category,
    Product,
    Favorite,
    CartItem,
    SyncMetadata,
  ],
});

export default database;

// Export table references for easy access
export const carBrandsCollection = database.get<CarBrand>('car_brands');
export const carModelsCollection = database.get<CarModel>('car_models');
export const productBrandsCollection = database.get<ProductBrand>('product_brands');
export const categoriesCollection = database.get<Category>('categories');
export const productsCollection = database.get<Product>('products');
export const favoritesCollection = database.get<Favorite>('favorites');
export const cartItemsCollection = database.get<CartItem>('cart_items');
export const syncMetadataCollection = database.get<SyncMetadata>('sync_metadata');

// Helper to reset database (for debugging)
export async function resetDatabase() {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
}
