using WellTrackAPI.Domain.Entities.Interfaces;

namespace WellTrackAPI.Infrastructure.Repositories.Interfaces
{
    
    public interface IGenericRepository<TEntity> where TEntity : class, ITrackerEntity
    {
        Task<IEnumerable<TEntity>> GetAllAsync(string userId);
        Task<TEntity?> GetByIdAsync(int id, string userId);

        Task<TEntity> CreateAsync(TEntity entity);
        Task UpdateAsync(TEntity entity);
        Task DeleteAsync(TEntity entity);
    }
}
