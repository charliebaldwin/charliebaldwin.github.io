precision highp float;
    
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

float sdfSphere(vec3 p, vec3 c, float r) {
    c += vec3(iResolution.x * 0.5, iResolution.y * 0.5, 0.);
    return distance(p, c) - r;
}
float sdfRect(vec3 p, float w) {
    return distance(p, vec3(0.000 * iResolution.x + iResolution.x * 0.504, p.y, p.z)) - w;
}
float smoothMin(float d1, float d2, float k) {
    float h = max(k-abs(d1-d2), 0.) / k;
    return min(d1, d2) - h*h*h*k*1.0/6.0;
}
float smoothMax(float d1, float d2, float k) {
    float h = min(k-abs(d1-d2), 0.0) / k;
    return max(d1, d2) - h*h*h*k*1.0/6.0;
}
float sceneDistance(vec3 p) {
    float sphere1 = sdfSphere(p, vec3(-0.2 * iResolution.x + 360.0 *  cos(iTime * 0.66 + 24.3), 500.0 * sin(iTime * 0.36 + 32.1), 100.),  100.0 + 60.0 * sin(iTime * 0.45 + 29.1));
    float sphere2 = sdfSphere(p, vec3(-0.2 * iResolution.x + 320.0  * cos(iTime * 0.44 + 94.3), 640.0 * sin(iTime * 0.28 + 92.4), 100.),  100.0 + 40.0 * sin(iTime * 0.32 + 95.1));
    float sphere3 = sdfSphere(p, vec3(-0.2 * iResolution.x + 340.0 *  cos(iTime * 0.51 + 44.3), 500.0 * sin(iTime * 0.33 + 56.8), 100.),  100.0 + 50.0 * sin(iTime * 0.37 + 52.1));
    float sphere4 = sdfSphere(p, vec3(-0.2 * iResolution.x + 400.0  * cos(iTime * 0.61 + 34.3), 680.0 * sin(iTime * 0.15 + 17.6), 100.),  100.0 + 60.0 * sin(iTime * 0.55 + 82.1));
    float sphere5 = sdfSphere(p, vec3( 0.2 * iResolution.x + 360.0 *  sin(iTime * 0.66 +  2.4), 500.0 * cos(iTime * 0.36 + 92.4), 100.),  100.0 + 60.0 * sin(iTime * 0.45 + 82.1));
    float sphere6 = sdfSphere(p, vec3( 0.2 * iResolution.x + 320.0 *  sin(iTime * 0.44 + 56.8), 640.0 * cos(iTime * 0.28 + 56.8), 100.),  100.0 + 40.0 * sin(iTime * 0.32 + 52.1));
    float sphere7 = sdfSphere(p, vec3( 0.2 * iResolution.x + 340.0 *  sin(iTime * 0.51 + 17.6), 500.0 * cos(iTime * 0.33 + 17.6), 100.),  100.0 + 50.0 * sin(iTime * 0.37 + 82.1));
    float sphere8 = sdfSphere(p, vec3( 0.2 * iResolution.x + 400.0 *  sin(iTime * 0.61 + 32.1), 680.0 * cos(iTime * 0.15 + 32.1), 100.),  100.0 + 60.0 * sin(iTime * 0.55 + 29.1));
    float sphereMouse1 = sdfSphere(p, vec3(iMouse.x - (iResolution.x / 2.0), iMouse.y - (iResolution.y / 2.0), 100.0), 30.0);
    float sphereMouse2 = sdfSphere(p, vec3(60. * sin(2.0*iTime) + iMouse.x - (iResolution.x / 2.0), 60. * cos(1.58*iTime) + iMouse.y - (iResolution.y / 2.0), 100.0), 20.0);
    
    float d = smoothMin(sphere1, sphere2, 90.0);
    d = smoothMin(d, sphere3, 90.0);
    d = smoothMin(d, sphere4, 90.0);
    d = smoothMin(d, sphere5, 90.0);
    d = smoothMin(d, sphere6, 90.0);
    d = smoothMin(d, sphere7, 90.0);
    d = smoothMin(d, sphere8, 90.0);
    d = smoothMin(d, sphereMouse1, 70.0);
    d = smoothMin(d, sphereMouse2, 40.0);
    d = smoothMin(d, sdfRect(p, max(0.225*iResolution.x, min(350.0, 0.45*iResolution.x))), 100.0);
    return d;
}

void main() {
    const int MAX_ITER = 100;
    const float MAX_DIST = 1000.0;
    const float MIN_DIST = 0.0001;
    
    vec3 p = vec3(gl_FragCoord.x, gl_FragCoord.y, 0.0);
    float d = sceneDistance(p);

    for (int i=0; i < MAX_ITER; i++) {
        if (d > MIN_DIST) {
            if (d > MAX_DIST) {
                d = MAX_DIST;
                p = vec3(0.0, 0.0, 0.0);
                break;
            }
            p += vec3(0.0, 0.0, d);
            d = sceneDistance(p);
        } else {
            break;
        }
    }

    vec4 color = vec4(gl_FragCoord.x / iResolution.x, gl_FragCoord.y / iResolution.y, 0.0, 1.0);
    if (distance(gl_FragCoord.xy, iMouse.xy) < 30.) {
        color = vec4(1.0, 1.0, 1.0, 1.0);
    } 
  
    d = floor(1.01 - clamp(d / 100.0, 0.0, 1.0));

    vec4 gradient = mix(vec4(1.0, 0.0, 0.5, 1.0), vec4(0.1, 0.6, 1.0, 1.0), gl_FragCoord.y / iResolution.y);
  
    color = mix(gradient, vec4(1.0,1.0,1.0,1.0), d);
    gl_FragColor = color;
}