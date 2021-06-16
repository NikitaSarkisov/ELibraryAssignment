using ELibrary.Models;
using ELibrary.Services;
using Microsoft.AspNetCore.Mvc;

namespace ELibrary.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService userService;

        public UserController(IUserService userService)
        {
            this.userService = userService;
        }

        [HttpPost("login")]
        public ActionResult<AuthenticateResult> Login([FromBody] LoginRequest login)
        {
            var result = userService.Authenticate(login);
            if (result == null) return NotFound();
            return result;
        }

        [HttpPost("register")]
        public ActionResult<AuthenticateResult> Register([FromBody] RegisterRequest register)
        {
            var result = userService.Register(register);
            if (result == null) return BadRequest();
            return result;
        }

        [HttpPost("refresh")]
        public ActionResult<AuthenticateResult> Refresh([FromBody] RefreshRequest refresh)
        {
            var result = userService.Refresh(refresh);
            if (result == null) return Unauthorized();
            return result;
        }
    }
}
