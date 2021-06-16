using System.ComponentModel.DataAnnotations;

namespace ELibrary.Models
{
    public class RefreshRequest
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
