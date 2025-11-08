import { useState } from 'react';
import { Settings, Building2, Mail, FileText, DollarSign, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Alert, AlertDescription } from '../../ui/alert';

export default function VistaConfiguracion() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Configuración de la empresa
  const [companyConfig, setCompanyConfig] = useState({
    name: 'Empresa de Energía Solar',
    nit: '900.123.456-7',
    address: 'Calle 123 #45-67',
    city: 'Barranquilla',
    phone: '+57 300 123 4567',
    email: 'info@energiasolar.com',
    website: 'www.energiasolar.com',
    logo: ''
  });

  // Configuración de cotizaciones
  const [quotationConfig, setQuotationConfig] = useState({
    validityDays: 30,
    taxRate: 19,
    defaultDiscount: 0,
    termsAndConditions: 'Los precios están sujetos a cambios sin previo aviso. La instalación está sujeta a disponibilidad de materiales.',
    paymentTerms: '50% anticipo, 50% contra entrega',
    warranty: '25 años en paneles solares, 10 años en inversores'
  });

  // Configuración de correo
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'info@energiasolar.com',
    fromName: 'Empresa de Energía Solar'
  });

  // Configuración general
  const [generalConfig, setGeneralConfig] = useState({
    currency: 'COP',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'America/Bogota',
    language: 'es',
    sessionTimeout: 30
  });

  const handleSave = async (section) => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            Configuración del Sistema
          </h1>
          <p className="text-slate-600 mt-2">
            Administra la configuración general del sistema y parámetros de la empresa
          </p>
        </div>
      </div>

      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Configuración guardada exitosamente
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs de Configuración */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">
            <Building2 className="w-4 h-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="quotations">
            <FileText className="w-4 h-4 mr-2" />
            Cotizaciones
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Correo
          </TabsTrigger>
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
        </TabsList>

        {/* Configuración de Empresa */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>
                Configura los datos básicos de tu empresa que aparecerán en documentos y cotizaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nombre de la Empresa</Label>
                  <Input
                    id="company-name"
                    value={companyConfig.name}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-nit">NIT</Label>
                  <Input
                    id="company-nit"
                    value={companyConfig.nit}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, nit: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">Dirección</Label>
                <Input
                  id="company-address"
                  value={companyConfig.address}
                  onChange={(e) => setCompanyConfig({ ...companyConfig, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-city">Ciudad</Label>
                  <Input
                    id="company-city"
                    value={companyConfig.city}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Teléfono</Label>
                  <Input
                    id="company-phone"
                    value={companyConfig.phone}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyConfig.email}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Sitio Web</Label>
                  <Input
                    id="company-website"
                    value={companyConfig.website}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, website: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('company')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Cotizaciones */}
        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Cotizaciones</CardTitle>
              <CardDescription>
                Define los parámetros por defecto para las cotizaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validity-days">Días de Validez</Label>
                  <Input
                    id="validity-days"
                    type="number"
                    value={quotationConfig.validityDays}
                    onChange={(e) => setQuotationConfig({ ...quotationConfig, validityDays: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">IVA (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={quotationConfig.taxRate}
                    onChange={(e) => setQuotationConfig({ ...quotationConfig, taxRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-discount">Descuento por Defecto (%)</Label>
                  <Input
                    id="default-discount"
                    type="number"
                    value={quotationConfig.defaultDiscount}
                    onChange={(e) => setQuotationConfig({ ...quotationConfig, defaultDiscount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Términos y Condiciones</Label>
                <Textarea
                  id="terms"
                  rows={4}
                  value={quotationConfig.termsAndConditions}
                  onChange={(e) => setQuotationConfig({ ...quotationConfig, termsAndConditions: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-terms">Términos de Pago</Label>
                <Textarea
                  id="payment-terms"
                  rows={2}
                  value={quotationConfig.paymentTerms}
                  onChange={(e) => setQuotationConfig({ ...quotationConfig, paymentTerms: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty">Garantía</Label>
                <Textarea
                  id="warranty"
                  rows={2}
                  value={quotationConfig.warranty}
                  onChange={(e) => setQuotationConfig({ ...quotationConfig, warranty: e.target.value })}
                />
              </div>

              <Button onClick={() => handleSave('quotations')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Correo */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Correo Electrónico</CardTitle>
              <CardDescription>
                Configura el servidor SMTP para el envío de correos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input
                    id="smtp-host"
                    value={emailConfig.smtpHost}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Puerto</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">Usuario SMTP</Label>
                  <Input
                    id="smtp-user"
                    value={emailConfig.smtpUser}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Contraseña</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={emailConfig.smtpPassword}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-email">Email Remitente</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">Nombre Remitente</Label>
                  <Input
                    id="from-name"
                    value={emailConfig.fromName}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('email')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Parámetros generales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input
                    id="currency"
                    value={generalConfig.currency}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Formato de Fecha</Label>
                  <Input
                    id="date-format"
                    value={generalConfig.dateFormat}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, dateFormat: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Input
                    id="timezone"
                    value={generalConfig.timeZone}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, timeZone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Input
                    id="language"
                    value={generalConfig.language}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, language: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Tiempo de Sesión (minutos)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={generalConfig.sessionTimeout}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, sessionTimeout: e.target.value })}
                />
              </div>

              <Button onClick={() => handleSave('general')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

