create policy "Admins can read application files"
on storage.objects for select to authenticated
using (bucket_id = 'application-files' and public.has_role(auth.uid(), 'admin'));