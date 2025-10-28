using System;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json;

namespace FriendSystem.Core
{
    public class ApiClient
    {
        private string baseUrl;
        private string authToken;
        private int timeout;

        public ApiClient(string baseUrl, int timeout = 30)
        {
            this.baseUrl = baseUrl;
            this.timeout = timeout;
        }

        public void SetAuthToken(string token)
        {
            authToken = token;
        }

        public async Task<T> GetAsync<T>(string endpoint)
        {
            using (UnityWebRequest request = UnityWebRequest.Get(baseUrl + endpoint))
            {
                request.timeout = timeout;
                
                if (!string.IsNullOrEmpty(authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                }

                var operation = request.SendWebRequest();
                
                while (!operation.isDone)
                {
                    await Task.Yield();
                }

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string json = request.downloadHandler.text;
                    return JsonConvert.DeserializeObject<T>(json);
                }
                else
                {
                    ErrorHandler.HandleApiError(request);
                    throw new Exception($"API Error: {request.error} - {request.downloadHandler.text}");
                }
            }
        }

        public async Task<T> PostAsync<T>(string endpoint, object data)
        {
            string json = data != null ? JsonConvert.SerializeObject(data) : "{}";
            byte[] bodyRaw = Encoding.UTF8.GetBytes(json);

            using (UnityWebRequest request = new UnityWebRequest(baseUrl + endpoint, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.timeout = timeout;

                if (!string.IsNullOrEmpty(authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                }

                var operation = request.SendWebRequest();
                
                while (!operation.isDone)
                {
                    await Task.Yield();
                }

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseJson = request.downloadHandler.text;
                    return JsonConvert.DeserializeObject<T>(responseJson);
                }
                else
                {
                    ErrorHandler.HandleApiError(request);
                    throw new Exception($"API Error: {request.error} - {request.downloadHandler.text}");
                }
            }
        }

        public async Task<T> PutAsync<T>(string endpoint, object data)
        {
            string json = data != null ? JsonConvert.SerializeObject(data) : "{}";
            byte[] bodyRaw = Encoding.UTF8.GetBytes(json);

            using (UnityWebRequest request = new UnityWebRequest(baseUrl + endpoint, "PUT"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.timeout = timeout;

                if (!string.IsNullOrEmpty(authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                }

                var operation = request.SendWebRequest();
                
                while (!operation.isDone)
                {
                    await Task.Yield();
                }

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseJson = request.downloadHandler.text;
                    return JsonConvert.DeserializeObject<T>(responseJson);
                }
                else
                {
                    ErrorHandler.HandleApiError(request);
                    throw new Exception($"API Error: {request.error} - {request.downloadHandler.text}");
                }
            }
        }

        public async Task<T> DeleteAsync<T>(string endpoint)
        {
            using (UnityWebRequest request = UnityWebRequest.Delete(baseUrl + endpoint))
            {
                request.downloadHandler = new DownloadHandlerBuffer();
                request.timeout = timeout;

                if (!string.IsNullOrEmpty(authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                }

                var operation = request.SendWebRequest();
                
                while (!operation.isDone)
                {
                    await Task.Yield();
                }

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string json = request.downloadHandler.text;
                    return JsonConvert.DeserializeObject<T>(json);
                }
                else
                {
                    ErrorHandler.HandleApiError(request);
                    throw new Exception($"API Error: {request.error} - {request.downloadHandler.text}");
                }
            }
        }
    }
}
