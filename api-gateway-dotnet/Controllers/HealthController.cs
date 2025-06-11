using Microsoft.AspNetCore.Mvc;

namespace ApiGateway.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("API Gateway is healthy");
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var services = new Dictionary<string, object>
        {
            { "inventory-service", "http://localhost:5000" },
            { "order-service", "http://localhost:5002" },
            { "customer-service", "http://localhost:5003" },
            { "payment-service", "http://localhost:5004" },
            { "notification-service", "http://localhost:5005" },
            { "alert-service", "http://localhost:5006" }
        };
        
        return Ok(new { 
            gateway = "healthy", 
            timestamp = DateTime.UtcNow,
            services = services
        });
    }
}
