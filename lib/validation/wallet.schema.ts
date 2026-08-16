// lib/validation/wallet.schema.ts
import { z } from 'zod';
import { WALLET_BANKS, type WalletBank } from '@/types/wallet.types';

// Mirrors src/validations/wallet.validations.js (Joi) di BE — jaga selaras kalau BE berubah.

const bankSchema = z.enum(WALLET_BANKS as [WalletBank, ...WalletBank[]], {
  errorMap: () => ({ message: 'Pilih jenis bank/dompet yang valid' }),
});

const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus hex 6 digit, contoh: #3B82F6')
  .optional()
  .or(z.literal(''));

const syncEmailSchema = z
  .string()
  .email('Format email tidak valid')
  .optional()
  .or(z.literal(''));

export const createWalletSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama dompet minimal 2 karakter')
    .max(50, 'Nama dompet maksimal 50 karakter'),
  bank: bankSchema,
  account_number: z
    .string()
    .min(3, 'Nomor rekening minimal 3 karakter')
    .max(20, 'Nomor rekening maksimal 20 karakter')
    .optional()
    .or(z.literal('')),
  initial_balance: z.coerce
    .number({ invalid_type_error: 'Saldo awal harus berupa angka' })
    .min(0, 'Saldo awal tidak boleh negatif')
    .default(0),
  currency: z
    .string()
    .length(3, 'Kode mata uang harus 3 karakter, contoh: IDR')
    .transform((v) => v.toUpperCase())
    .default('IDR'),
  color: colorSchema,
  icon: z.string().optional(),
  is_default: z.boolean().default(false),
  sync_email: syncEmailSchema,
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().or(z.literal('')),
});

export const updateWalletSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama dompet minimal 2 karakter')
    .max(50, 'Nama dompet maksimal 50 karakter')
    .optional(),
  bank: bankSchema.optional(),
  account_number: z
    .string()
    .min(3, 'Nomor rekening minimal 3 karakter')
    .max(20, 'Nomor rekening maksimal 20 karakter')
    .optional()
    .or(z.literal('')),
  currency: z
    .string()
    .length(3, 'Kode mata uang harus 3 karakter, contoh: IDR')
    .transform((v) => v.toUpperCase())
    .optional(),
  color: colorSchema,
  icon: z.string().optional(),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
  sync_email: syncEmailSchema,
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().or(z.literal('')),
});

export const updateWalletBalanceSchema = z.object({
  balance: z.coerce
    .number({ invalid_type_error: 'Saldo harus berupa angka' })
    .min(0, 'Saldo tidak boleh negatif')
    .refine((v) => isFinite(v), 'Saldo harus berupa angka yang valid'),
  notes: z.string().max(255, 'Catatan maksimal 255 karakter').optional(),
});

export type CreateWalletFormValues = z.infer<typeof createWalletSchema>;
export type UpdateWalletFormValues = z.infer<typeof updateWalletSchema>;
export type UpdateWalletBalanceFormValues = z.infer<typeof updateWalletBalanceSchema>;