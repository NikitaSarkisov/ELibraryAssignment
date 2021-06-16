using System.ComponentModel.DataAnnotations;

namespace ELibrary.Models
{
    public class LoginRequest
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
