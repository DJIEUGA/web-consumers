// Export all shadcn UI components from here for convenient importing
// All components are styled according to Jobty design system (Indigo primary, 12px radius)
// See DESIGN_SYSTEM.md for detailed usage and theming information

export { Button, buttonVariants } from "@/components/ui/ShadcnButton"
export type { ButtonProps } from "@/components/ui/ShadcnButton"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card"

export { Input } from "@/components/ui/Input"
export type { InputProps } from "@/components/ui/Input"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/Select"

export { Label } from "@/components/ui/Label"

export { Badge, badgeVariants } from "@/components/ui/Badge"
export type { BadgeProps } from "@/components/ui/Badge"

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from "@/components/ui/Form"
