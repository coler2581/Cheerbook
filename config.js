/* Cheer Playbook Beta settings.
   Leave supabaseUrl and supabaseAnonKey empty to run in "this device only" mode (no sign-in, nothing shared).
   To go online: create a Supabase project, run supabase/schema.sql in its SQL Editor, then paste the
   Project URL and the anon public key from Project Settings > API below. Never put the service_role key here. */
window.CP_CONFIG = {
  supabaseUrl: 'https://eqdpuiefemaqtcbadwps.supabase.co',
  supabaseAnonKey: 'sb_publishable_CWR4dKPI-emGsZocwr5ozw__FQqRvQK',
  google: false,          // true once Google sign-in is turned on in Supabase > Authentication > Providers
  storageMB: 1024,        // shown in the Library as the storage limit (Supabase free plan: 1 GB)
  athletePollMs: 4000,    // how often an open athlete view checks for changes
  version: '0.9.0'
};
