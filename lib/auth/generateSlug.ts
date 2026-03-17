import { SupabaseClient } from '@supabase/supabase-js';

export async function generateSlug(
  email: string,
  supabase: SupabaseClient
): Promise<string> {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  let slug = base;
  let count = 1;

  while (true) {
    const { data, error } = await supabase
      .from('users')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(`Slug check failed: ${error.message}`);
    if (!data) break;

    slug = `${base}${count}`;
    count++;
  }

  return slug;
}
```

---

**FILE 3**
Filename:
```
app/auth/callback/route.ts
