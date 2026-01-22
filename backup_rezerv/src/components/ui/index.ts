// ============================================
// UI COMPONENTS - BARREL EXPORT
// ============================================

// Buttons
export { Button, IconButton, CTAButton } from './Button'
export type { ButtonProps, IconButtonProps, CTAButtonProps } from './Button'

// Inputs
export { Input, PhoneInput, SearchInput, OTPInput } from './Input'
export type { InputProps, PhoneInputProps, SearchInputProps, OTPInputProps } from './Input'

// Badges
export {
  Badge,
  UrgencyBadge,
  CountdownBadge,
  SlotsBadge,
  RatingBadge,
  VerifiedBadge,
  ProBadge,
  InstantBadge,
} from './Badge'
export type {
  BadgeProps,
  UrgencyBadgeProps,
  CountdownBadgeProps,
  SlotsBadgeProps,
  RatingBadgeProps,
} from './Badge'

// Cards
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  ShiftCard,
  StatsCard,
} from './Card'
export type {
  CardProps,
  CardHeaderProps,
  ShiftCardProps,
  StatsCardProps,
} from './Card'

// Avatars
export { Avatar, AvatarGroup, WorkerAvatar, EmployerAvatar } from './Avatar'
export type {
  AvatarProps,
  AvatarGroupProps,
  WorkerAvatarProps,
  EmployerAvatarProps,
} from './Avatar'

// Bottom Sheet
export {
  BottomSheet,
  BottomSheetContent,
  BottomSheetActions,
  ActionSheet,
} from './BottomSheet'
export type {
  BottomSheetProps,
  ActionSheetOption,
  ActionSheetProps,
} from './BottomSheet'

// Modal
export { Modal, ModalFooter, ConfirmModal, SuccessModal } from './Modal'
export type {
  ModalProps,
  ConfirmModalProps,
  SuccessModalProps,
} from './Modal'

// Toast (will be created separately)
export { Toast, ToastProvider, useToast } from './Toast'
