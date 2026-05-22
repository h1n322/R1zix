using System;

namespace RiskMate.Api.Models
{
    public class User
    {
        public int Id { get; set; }  
        
        public string FirebaseUid { get; set; } = string.Empty;
        
        public string Email { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public List<Portfolio> Portfolios { get; set; } = [];
    }
}