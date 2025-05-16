import { storage } from '../storage';
import { hashPassword } from './password';
import { logger } from './logger';

/**
 * Creates a default customer account for testing purposes
 * This allows initial access to the customer features of the platform
 */
export const createDefaultCustomer = async (): Promise<void> => {
  try {
    logger.info('Checking for default customer account...');
    
    // Check if the default customer already exists
    const existingCustomer = await storage.getUserByEmail('customer@desiconnect.com');
    
    if (!existingCustomer) {
      // If the test customer doesn't exist, create it
      logger.info('Creating default customer account for testing...');
      
      const defaultEmail = 'customer@desiconnect.com';
      const defaultPassword = 'Customer@123';
      const hashedPassword = await hashPassword(defaultPassword);
      
      await storage.createUser({
        email: defaultEmail,
        password: hashedPassword,
        name: 'Test Customer',
        address: '123 Test Street, Test City, 12345',
      });
      
      logger.info(`Default customer created with email: ${defaultEmail}`);
      logger.info(`Default password: ${defaultPassword}`);
    } else {
      logger.info('Default customer account already exists.');
    }
  } catch (error) {
    logger.error('Failed to create default customer:', error);
  }
};