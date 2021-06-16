namespace ELibrary.Settings
{
    public class AuthSettings
    {
        public string Secret { get; set; }
        public long AccessLifetime { get; set; }
        public long RefreshLifetime { get; set; }
    }
}
