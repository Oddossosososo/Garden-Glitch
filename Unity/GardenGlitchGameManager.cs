using System;
using UnityEngine;

namespace GardenGlitch.Unity
{
    /// <summary>
    /// Minimal native Unity entry point for GardenGlitch.
    /// Browser-facing features remain in the existing JavaScript/TypeScript layer.
    /// </summary>
    public sealed class GardenGlitchGameManager : MonoBehaviour
    {
        public static GardenGlitchGameManager Instance { get; private set; }

        [Header("Game State")]
        [SerializeField] private long coins;
        [SerializeField] private float growthMultiplier = 1f;
        [SerializeField] private int characterId;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public long Coins
        {
            get => coins;
            set => coins = Math.Max(0, value);
        }

        public float GrowthMultiplier
        {
            get => growthMultiplier;
            set => growthMultiplier = Mathf.Max(0f, value);
        }

        public int CharacterId
        {
            get => characterId;
            set => characterId = Mathf.Max(0, value);
        }

        public void ResetState()
        {
            coins = 0;
            growthMultiplier = 1f;
            characterId = 0;
        }
    }
}
