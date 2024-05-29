#version 300 es

precision highp float;
uniform vec2 u_resolution;           // viewport resolution (in pixels)
uniform float iTime;                 // shader playback time (in seconds)
uniform float speed;
uniform float cloudscale;
const float clouddark = 0.5f;
const float cloudlight = 0.3f;
const float cloudcover = 0.2f;
const float cloudalpha = 8.0f;
const float skytint = 0.5f;
const vec3 skycolour1 = vec3(0.2f, 0.4f, 0.6f);
const vec3 skycolour2 = vec3(0.4f, 0.7f, 1.0f);

const mat2 m = mat2(1.6f, 1.2f, -1.2f, 1.6f);

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1f, 311.7f)), dot(p, vec2(269.5f, 183.3f)));
    return -1.0f + 2.0f * fract(sin(p) * 43758.5453123f);
}

float noise(vec2 p) {
    const float K1 = 0.366025404f; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865f; // (3-sqrt(3))/6;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0f, 0.0f) : vec2(0.0f, 1.0f); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
    vec2 b = a - o + K2;
    vec2 c = a - 1.0f + 2.0f * K2;
    vec3 h = max(0.5f - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0f);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0f)), dot(b, hash(i + o)), dot(c, hash(i + 1.0f)));
    return dot(n, vec3(70.0f));
}

float fbm(vec2 n) {
    float total = 0.0f, amplitude = 0.1f;
    for(int i = 0; i < 7; i++) {
        total += noise(n) * amplitude;
        n = m * n;
        amplitude *= 0.4f;
    }
    return total;
}

// -----------------------------------------------

vec4 mainImage(vec2 fragCoord) {
    vec2 p = fragCoord.xy / u_resolution.xy;
    vec2 uv = p * vec2(u_resolution.x / u_resolution.y, 1.0f);
    float time = iTime * speed;
    float q = fbm(uv * cloudscale * 0.5f);

    //ridged noise shape
    float r = 0.0f;
    uv *= cloudscale;
    uv -= q - time;
    float weight = 0.8f;
    for(int i = 0; i < 8; i++) {
        r += abs(weight * noise(uv));
        uv = m * uv + time;
        weight *= 0.7f;
    }

    //noise shape
    float f = 0.0f;
    uv = p * vec2(u_resolution.x / u_resolution.y, 1.0f);
    uv *= cloudscale;
    uv -= q - time;
    weight = 0.7f;
    for(int i = 0; i < 8; i++) {
        f += weight * noise(uv);
        uv = m * uv + time;
        weight *= 0.6f;
    }

    f *= r + f;

    //noise colour
    float c = 0.0f;
    time = iTime * speed * 2.0f;
    uv = p * vec2(u_resolution.x / u_resolution.y, 1.0f);
    uv *= cloudscale * 2.0f;
    uv -= q - time;
    weight = 0.4f;
    for(int i = 0; i < 7; i++) {
        c += weight * noise(uv);
        uv = m * uv + time;
        weight *= 0.6f;
    }

    //noise ridge colour
    float c1 = 0.0f;
    time = iTime * speed * 3.0f;
    uv = p * vec2(u_resolution.x / u_resolution.y, 1.0f);
    uv *= cloudscale * 3.0f;
    uv -= q - time;
    weight = 0.4f;
    for(int i = 0; i < 7; i++) {
        c1 += abs(weight * noise(uv));
        uv = m * uv + time;
        weight *= 0.6f;
    }

    c += c1;

    vec3 skycolour = mix(skycolour2, skycolour1, p.y);
    vec3 cloudcolour = vec3(1.1f, 1.1f, 0.9f) * clamp((clouddark + cloudlight * c), 0.0f, 1.0f);

    f = cloudcover + cloudalpha * f * r;

    vec3 result = mix(skycolour, clamp(skytint * skycolour + cloudcolour, 0.0f, 1.0f), clamp(f + c, 0.0f, 1.0f));

    return vec4(result, 1.0f);
}
out vec4 outColor;
in vec2 v_texCoord;

void main() {
    outColor = mainImage(v_texCoord.xy);
}