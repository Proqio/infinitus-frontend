---
name: react-hook-form
description: React Hook Form v7 best practices with proqio-ui Form components. Trigger when creating forms, using useForm, FormField, FormItem, FormLabel, FormControl, FormMessage, handling form validation, or integrating react-hook-form with proqio-ui.
license: Apache-2.0
metadata:
    author: Infinitus
    version: '1.0'
    scope: [frontend, ui]
    auto_invoke: 'Creating forms, using useForm, using FormField or FormControl, handling form submission, form validation, form with proqio-ui'
    allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Critical Rules

- **ALWAYS** use proqio-ui `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` — never build custom form wrappers
- **ALWAYS** use `zodResolver` with a Zod schema for validation (requires `@hookform/resolvers`)
- **NEVER** use `register()` directly with proqio-ui inputs — use `<FormField render={({ field }) => ...}>`
- **NEVER** spread `field` onto non-native elements without checking prop compatibility
- **ALWAYS** put `<FormMessage />` after `<FormControl>` inside `<FormItem>` — it auto-renders the error
- **ALWAYS** type `useForm<FormData>()` with the inferred Zod type
- **NEVER** call `form.reset()` inside `handleSubmit` — call it after async operations resolve

## Standard Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  FormDescription, TextField, Button,
} from 'proqio-ui';

const schema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.email({ message: 'Enter a valid email' }),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  function onSubmit(data: FormData) {
    // data is fully typed and validated
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <TextField {...field} placeholder="John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <TextField {...field} type="email" placeholder="you@example.com" />
              </FormControl>
              <FormDescription>We'll never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="primary"
          loading={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

## proqio-ui Form Components Reference

| Component               | Purpose                            | Notes                                                             |
| ----------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| `Form`                  | Root context provider              | Spread `{...form}` from `useForm()`                               |
| `FormField`             | Connects a field to RHF Controller | Requires `control` + `name` + `render`                            |
| `FormItem`              | Wrapper div with spacing           | Contains label + control + message                                |
| `FormLabel`             | Styled label with error state      | Automatically marks red on error                                  |
| `FormLabelOptionalText` | Appends "(optional)" to label      | `<FormLabel>Email<FormLabelOptionalText /></FormLabel>`           |
| `FormControl`           | Radix Slot connecting to field     | Passes `aria-*` and `id` automatically                            |
| `FormDescription`       | Helper text below control          | Shown always (not an error)                                       |
| `FormMessage`           | Error message                      | Auto-displays `field.error.message`; renders `null` when no error |
| `useFormField`          | Hook for custom field components   | Exposes `invalid`, `error`, `id`, etc.                            |

## Input Components per Field Type

### TextField (text, email, password, url)

```typescript
<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <TextField {...field} type="password" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea

```typescript
import { Textarea, TextareaCounter } from 'proqio-ui';

<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea {...field} maxLength={500} rows={4} />
      </FormControl>
      <TextareaCounter value={field.value ?? ''} maxLength={500} />
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select (custom cmdk-based)

Select uses controlled `value`/`onValueChange` — do NOT spread `field` directly:

```typescript
import {
  Select, SelectTrigger, SelectValue, SelectDropdown,
  SelectContent, SelectList, SelectItem,
} from 'proqio-ui';

<FormField
  control={form.control}
  name="provider"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Provider</FormLabel>
      <Select
        open={open}
        onOpenChange={setOpen}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select provider">
              {field.value}
            </SelectValue>
          </SelectTrigger>
        </FormControl>
        <SelectDropdown>
          <SelectContent>
            <SelectList>
              <SelectItem onSelect={() => { field.onChange('aws'); setOpen(false); }}>
                AWS
              </SelectItem>
              <SelectItem onSelect={() => { field.onChange('azure'); setOpen(false); }}>
                Azure
              </SelectItem>
              <SelectItem onSelect={() => { field.onChange('gcp'); setOpen(false); }}>
                GCP
              </SelectItem>
            </SelectList>
          </SelectContent>
        </SelectDropdown>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox

```typescript
import { Checkbox } from 'proqio-ui';

<FormField
  control={form.control}
  name="acceptTerms"
  render={({ field }) => (
    <FormItem className="flex items-center gap-2">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <FormLabel className="!mt-0">Accept terms and conditions</FormLabel>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Switch

```typescript
import { Switch } from 'proqio-ui';

<FormField
  control={form.control}
  name="enableNotifications"
  render={({ field }) => (
    <FormItem className="flex items-center gap-3">
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <FormLabel className="!mt-0">Enable notifications</FormLabel>
      <FormMessage />
    </FormItem>
  )}
/>
```

### RadioGroup

```typescript
import { RadioGroup, RadioGroupItem } from 'proqio-ui';

<FormField
  control={form.control}
  name="plan"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Plan</FormLabel>
      <FormControl>
        <RadioGroup value={field.value} onValueChange={field.onChange}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="free" id="free" />
            <label htmlFor="free">Free</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="pro" id="pro" />
            <label htmlFor="pro">Pro</label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Optional Fields Pattern

```typescript
const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// In JSX:
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Description
        <FormLabelOptionalText />
      </FormLabel>
      <FormControl>
        <Textarea {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Form State Patterns

```typescript
const { formState: { isSubmitting, isDirty, isValid, errors } } = form;

// Disable submit when invalid or submitting
<Button
  type="submit"
  variant="primary"
  loading={isSubmitting}
  disabled={!isDirty || !isValid}
>
  Save
</Button>

// Reset after async submit
async function onSubmit(data: FormData) {
  await saveData(data);
  form.reset();
}

// Set field programmatically
form.setValue('email', 'new@example.com', { shouldValidate: true });

// Watch a field value
const watchedEmail = form.watch('email');

// Trigger validation manually
await form.trigger('email');
```

## Cross-Field Validation (superRefine)

```typescript
const schema = z
    .object({
        password: z.string().min(8),
        confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passwords don't match",
                path: ['confirmPassword'],
            });
        }
    });
```

## Async Submission with Error Handling

```typescript
async function onSubmit(data: FormData) {
  try {
    await apiCall(data);
    form.reset();
    toast.success('Saved!');
  } catch (err) {
    // Set server-side errors on specific fields
    form.setError('email', {
      type: 'server',
      message: 'This email is already taken',
    });
    // Or set a root error
    form.setError('root', {
      message: 'Something went wrong. Please try again.',
    });
  }
}

// Display root error
{form.formState.errors.root && (
  <Callout variant="danger">{form.formState.errors.root.message}</Callout>
)}
```

## Multi-Step Form

```typescript
// Use a single form across steps — only validate the current step's fields
const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
});

async function handleNextStep(fieldsToValidate: (keyof FormData)[]) {
    const valid = await form.trigger(fieldsToValidate);
    if (valid) setStep(step + 1);
}
```

## Validation Modes

```typescript
useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur', // validate on blur (recommended for UX)
    // mode: 'onChange',  // validate on every keystroke
    // mode: 'onSubmit',  // validate only on submit (default)
    // mode: 'all',       // validate on both blur and change
});
```

## Commands

```bash
# Install resolver (required for Zod integration)
npm install @hookform/resolvers
```
