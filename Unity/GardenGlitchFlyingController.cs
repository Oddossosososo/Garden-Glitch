using UnityEngine;

namespace GardenGlitch.Unity
{
    /// <summary>
    /// Optional flying controller for a player GameObject.
    /// Add this component to the player and assign the Rigidbody.
    /// Controls: Space = fly up, Left Ctrl = fly down, WASD = move.
    /// </summary>
    public sealed class GardenGlitchFlyingController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Rigidbody playerBody;

        [Header("Flight")]
        [SerializeField] private float horizontalSpeed = 7f;
        [SerializeField] private float verticalSpeed = 6f;
        [SerializeField] private float acceleration = 20f;
        [SerializeField] private bool flying;
        [SerializeField] private KeyCode toggleKey = KeyCode.F;

        public bool Flying => flying;

        private void Reset()
        {
            playerBody = GetComponent<Rigidbody>();
        }

        private void Awake()
        {
            if (playerBody == null)
                playerBody = GetComponent<Rigidbody>();
        }

        private void Update()
        {
            if (Input.GetKeyDown(toggleKey))
                flying = !flying;
        }

        private void FixedUpdate()
        {
            if (playerBody == null || !flying)
                return;

            float x = Input.GetAxisRaw("Horizontal");
            float z = Input.GetAxisRaw("Vertical");
            float y = 0f;

            if (Input.GetKey(KeyCode.Space))
                y += 1f;
            if (Input.GetKey(KeyCode.LeftControl) || Input.GetKey(KeyCode.C))
                y -= 1f;

            Vector3 input = new Vector3(x, y, z).normalized;
            Vector3 targetVelocity = new Vector3(
                input.x * horizontalSpeed,
                input.y * verticalSpeed,
                input.z * horizontalSpeed
            );

            playerBody.velocity = Vector3.MoveTowards(
                playerBody.velocity,
                targetVelocity,
                acceleration * Time.fixedDeltaTime
            );
        }

        public void SetFlying(bool enabled)
        {
            flying = enabled;
            if (!enabled && playerBody != null)
            {
                playerBody.velocity = new Vector3(
                    playerBody.velocity.x,
                    0f,
                    playerBody.velocity.z
                );
            }
        }
    }
}
