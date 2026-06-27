REVOKE EXECUTE ON FUNCTION public.can_view_property(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_edit_property(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_property(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_property(uuid, uuid) TO service_role;