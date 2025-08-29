# Configuración de Cloudflare Images para Subida de Imágenes

## Requisitos Previos

1. **Cuenta de Cloudflare** con acceso a Images
2. **API Token** con permisos para Images

## Pasos de Configuración

### 1. Obtener Account ID de Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. En la barra lateral derecha, copia tu **Account ID**

### 2. Crear API Token

1. Ve a [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Haz clic en **"Create Token"**
3. Selecciona **"Custom token"**
4. Configura los permisos:
   - **Account Resources**: `Cloudflare Images`
   - **Permissions**: `Edit` para Images
5. Haz clic en **"Continue to summary"** y luego **"Create Token"**
6. **IMPORTANTE**: Copia el token generado (no podrás verlo de nuevo)

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto con:

```bash
# Cloudflare Images API Configuration
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=tu_account_id_aqui
NEXT_PUBLIC_CLOUDFLARE_API_TOKEN=tu_api_token_aqui
```

### 4. Verificar Configuración

1. Reinicia tu servidor de desarrollo
2. Ve al formulario de productos
3. Pega una URL de imagen externa
4. Haz clic en "Subir a Cloudflare"

## Uso en el Formulario

### Imagen por Defecto
- Pega la URL de la imagen externa
- Haz clic en "Subir a Cloudflare"
- La imagen se descargará, subirá a Cloudflare y se reemplazará la URL

### Variantes de Color
- Cada variante tiene su propio campo de imagen
- Sigue el mismo proceso para cada imagen

## Flujo de Trabajo

1. **Usuario pega URL externa** (ej: https://griferiapeirano.com/wp-content/uploads/2025/05/62-175DG_Pulse-lavatorio-de-pared-Dark-Gold.jpg)
2. **Sistema descarga la imagen** desde la URL externa
3. **Sistema sube la imagen** a Cloudflare Images
4. **Cloudflare devuelve URL única** (ej: https://imagedelivery.net/account_id/image_id/public)
5. **URL de Cloudflare se guarda** en la base de datos
6. **Producto se asocia** con la imagen optimizada

## Beneficios

- ✅ **CDN global** de Cloudflare para mejor rendimiento
- ✅ **Optimización automática** de imágenes
- ✅ **URLs únicas** y persistentes
- ✅ **Escalabilidad** para manejar muchas imágenes
- ✅ **Backup automático** en Cloudflare

## Solución de Problemas

### Error: "No se pudo descargar la imagen"
- Verifica que la URL sea accesible públicamente
- Asegúrate de que la imagen no requiera autenticación

### Error: "Error al subir a Cloudflare"
- Verifica que las variables de entorno estén configuradas correctamente
- Confirma que el API token tenga los permisos correctos
- Revisa que tu cuenta de Cloudflare tenga Images habilitado

### Error: "HTTP error! status: 403"
- El API token no tiene permisos suficientes
- Regenera el token con permisos de "Edit" para Images

## Notas Importantes

- Las imágenes se almacenan permanentemente en Cloudflare
- Cada imagen tiene un ID único que no cambia
- Las URLs de Cloudflare son públicas por defecto
- El sistema mantiene la URL original como referencia
