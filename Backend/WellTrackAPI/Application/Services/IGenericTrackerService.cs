using WellTrackAPI.Domain.Entities.Interfaces;

namespace WellTrackAPI.Application.Services
{
    public interface IGenericTrackerService<TDto, TEntity> 
        where TEntity : class, ITrackerEntity
    {

        Task<IEnumerable<TEntity>> GetAllAsync(string userId);
        Task<TEntity> GetByIdAsync(int id, string userId);
        Task<TEntity> CreateAsync(TDto dto, string userId);
        Task<bool> UpdateAsync(int id, TDto dto, string userId);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
