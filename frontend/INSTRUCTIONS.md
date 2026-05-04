# Meditrack APK — Guide de build

## Fichiers à remplacer dans ton projet

| Fichier généré | Destination dans ton projet |
|---|---|
| `src/App.tsx` | `src/App.tsx` |
| `src/services/api.ts` | `src/services/api.ts` |
| `src/components/ServerSetup.tsx` | `src/components/ServerSetup.tsx` (nouveau fichier) |
| `capacitor.config.ts` | `capacitor.config.ts` (racine du projet) |

---

## Étapes de build

### 1. Remplace les fichiers
Copie les 4 fichiers fournis aux emplacements indiqués.

### 2. Vérifie que CAP_SERVER_URL n'est PAS définie
```powershell
# Dans PowerShell :
Remove-Item Env:CAP_SERVER_URL -ErrorAction SilentlyContinue
echo $env:CAP_SERVER_URL   # doit être vide
```

### 3. Build du front React
```bash
npm run build
```
Vérifie que `dist/index.html` existe.

### 4. Sync Capacitor
```bash
npx cap sync android
```
Vérifie que `android/app/src/main/assets/public/index.html` existe.

### 5. Build APK dans Android Studio
```bash
npx cap open android
```
Dans Android Studio : **Build → Build Bundle(s)/APK(s) → Build APK(s)**

L'APK se trouve dans : `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Comportement de l'app

1. **Premier lancement** → Écran "Connexion au serveur" (vert/blanc)
   - Entrer l'IP du PC + port backend (ex: `192.168.1.45:8080`)
   - L'URL est sauvegardée → plus demandée aux prochains lancements

2. **Lancements suivants** → Directement sur la page Login

3. **Changer de serveur** → Vider le storage Android (ou ajouter un bouton dans Profil)

---

## Changer le serveur depuis le profil patient (optionnel)

Dans `src/pages/patient/Patientprofil.tsx`, ajouter :

```typescript
import { clearServerUrl } from "../../services/api";
import { authService } from "../../services/Authservice";

const handleChangeServer = () => {
    clearServerUrl();
    authService.logout();
    window.location.reload();
};

// Dans le JSX :
<button onClick={handleChangeServer} className="btn btn-outline-danger btn-sm">
    <i className="bi bi-hdd-network me-2"></i>
    Changer de serveur
</button>
```

---

## Icône de l'application

1. Place ton `public/logo.png` dans `android/app/src/main/res/`
2. Dans Android Studio : **File → New → Image Asset**
   - Icon Type: Launcher Icons
   - Source: ton logo.png
   - Valider → Android Studio génère toutes les tailles automatiquement

Ou via la CLI :
```bash
npm install -g @capacitor/assets
npx @capacitor/assets generate --android
# (place logo.png dans assets/icon.png avant)
```
