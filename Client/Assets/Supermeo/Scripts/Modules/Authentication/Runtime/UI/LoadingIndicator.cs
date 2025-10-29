using UnityEngine;

namespace Authentication.UI
{
    public class LoadingIndicator : MonoBehaviour
    {
        [Header("Animation Settings")]
        [SerializeField] private float rotationSpeed = 360f;
        [SerializeField] private RectTransform animatedElement;
        
        private bool isAnimating = false;
        
        private void Awake()
        {
            // If no animated element is assigned, use this object's RectTransform
            if (animatedElement == null)
            {
                animatedElement = GetComponent<RectTransform>();
            }
        }
        
        private void Update()
        {
            if (isAnimating && animatedElement != null)
            {
                // Rotate the element continuously
                animatedElement.Rotate(0f, 0f, -rotationSpeed * Time.deltaTime);
            }
        }
        
        /// <summary>
        /// Show the loading indicator and start animation
        /// </summary>
        public void Show()
        {
            gameObject.SetActive(true);
            isAnimating = true;
        }
        
        /// <summary>
        /// Hide the loading indicator and stop animation
        /// </summary>
        public void Hide()
        {
            isAnimating = false;
            gameObject.SetActive(false);
        }
    }
}
