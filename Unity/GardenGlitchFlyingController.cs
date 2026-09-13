using System;
using System.Globalization;
using UnityEngine;

namespace GardenGlitch.Unity
{
    /// <summary>
    /// Flying controller plus an optional development-only player test console.
    /// The console uses whitelisted commands; it does not execute arbitrary C#.
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

        [Header("Player Hook Debug")]
        [SerializeField] private bool enableDebugConsole = true;
        [SerializeField] private KeyCode debugToggleKey = KeyCode.BackQuote;
        [SerializeField] private bool debugCommandsEnabled = true;
        [SerializeField] private float debugMaxSpeed = 40f;

        private bool debugOpen;
        private string debugInput = string.Empty;
        private string debugOutput = "GardenGlitch debug ready. Type help.";
        private Vector2 debugScroll;

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

            if (enableDebugConsole && Input.GetKeyDown(debugToggleKey))
                debugOpen = !debugOpen;
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

        private void OnGUI()
        {
            if (!enableDebugConsole || !debugOpen)
                return;

            const float width = 560f;
            const float height = 330f;
            Rect windowRect = new Rect(20f, 20f, width, height);
            GUI.Window(9871, windowRect, DrawDebugWindow, "GardenGlitch • Player Hook Test");
        }

        private void DrawDebugWindow(int id)
        {
            GUILayout.BeginVertical();
            GUILayout.Label("Whitelisted development commands only.");

            debugScroll = GUILayout.BeginScrollView(debugScroll, GUILayout.Height(170f));
            GUILayout.Label(debugOutput);
            GUILayout.EndScrollView();

            GUILayout.BeginHorizontal();
            GUI.SetNextControlName("GGDebugInput");
            debugInput = GUILayout.TextField(debugInput);
            if (GUILayout.Button("Run", GUILayout.Width(70f)))
                RunDebugCommand();
            GUILayout.EndHorizontal();

            GUILayout.Space(6f);
            GUILayout.Label("help • fly on/off • speed N • up N • down N • stop • pos");
            GUILayout.Label("F toggles flying • ` toggles this console");
            GUILayout.EndVertical();
            GUI.DragWindow(new Rect(0f, 0f, width: 10000f, height: 24f));
        }

        private void RunDebugCommand()
        {
            string command = debugInput.Trim();
            debugInput = string.Empty;

            if (string.IsNullOrWhiteSpace(command))
                return;

            if (!debugCommandsEnabled)
            {
                debugOutput = "Debug commands are disabled.";
                return;
            }

            string[] parts = command.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            string name = parts[0].ToLowerInvariant();

            switch (name)
            {
                case "help":
                    debugOutput = "help | fly on/off | speed N | up N | down N | stop | pos";
                    break;

                case "fly":
                    if (parts.Length < 2)
                    {
                        debugOutput = $"Flying: {flying}";
                        break;
                    }

                    if (parts[1].Equals("on", StringComparison.OrdinalIgnoreCase))
                    {
                        SetFlying(true);
                        debugOutput = "Flying enabled.";
                    }
                    else if (parts[1].Equals("off", StringComparison.OrdinalIgnoreCase))
                    {
                        SetFlying(false);
                        debugOutput = "Flying disabled.";
                    }
                    else
                    {
                        debugOutput = "Usage: fly on | fly off";
                    }
                    break;

                case "speed":
                    if (TryNumber(parts, out float speed))
                    {
                        horizontalSpeed = Mathf.Clamp(speed, 0f, debugMaxSpeed);
                        verticalSpeed = Mathf.Clamp(speed, 0f, debugMaxSpeed);
                        debugOutput = $"Flight speed set to {horizontalSpeed:0.##}.";
                    }
                    else
                    {
                        debugOutput = "Usage: speed 12";
                    }
                    break;

                case "up":
                    if (TryNumber(parts, out float up))
                    {
                        MoveVertical(Mathf.Clamp(up, 0f, debugMaxSpeed));
                        debugOutput = $"Moved up {up:0.##}.";
                    }
                    else
                    {
                        debugOutput = "Usage: up 5";
                    }
                    break;

                case "down":
                    if (TryNumber(parts, out float down))
                    {
                        MoveVertical(-Mathf.Clamp(down, 0f, debugMaxSpeed));
                        debugOutput = $"Moved down {down:0.##}.";
                    }
                    else
                    {
                        debugOutput = "Usage: down 5";
                    }
                    break;

                case "stop":
                    if (playerBody != null)
                        playerBody.velocity = Vector3.zero;
                    debugOutput = "Player velocity stopped.";
                    break;

                case "pos":
                    Vector3 p = transform.position;
                    debugOutput = $"Position: {p.x:0.##}, {p.y:0.##}, {p.z:0.##}";
                    break;

                default:
                    debugOutput = "Unknown command. Type help.";
                    break;
            }
        }

        private bool TryNumber(string[] parts, out float value)
        {
            value = 0f;
            return parts.Length > 1 && float.TryParse(
                parts[1],
                NumberStyles.Float,
                CultureInfo.InvariantCulture,
                out value
            );
        }

        private void MoveVertical(float amount)
        {
            if (playerBody != null)
                playerBody.MovePosition(playerBody.position + Vector3.up * amount);
        }
    }
}
