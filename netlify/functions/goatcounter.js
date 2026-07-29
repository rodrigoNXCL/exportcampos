// netlify/functions/goatcounter.js
// Proxy para obtener métricas reales de GoatCounter usando el Secret Token
// Autor: nxchile.com

exports.handler = async (event, context) => {
    const site = 'exportcampos';
    const secretToken = '1r446ex4n72m5v1y1c23a1hf5o3e504z5g'; // Tu token real
    const url = `https://${site}.goatcounter.com/stats.json?access-token=${secretToken}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Error en respuesta de GoatCounter:', response.status, response.statusText);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'No se pudieron cargar métricas' })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Permite acceso desde tu dashboard
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error en función GoatCounter:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Error interno' })
        };
    }
};