import React, { useState, useRef } from 'react';
import { FileDown, Plus, Trash2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Client, Component, Development, Quotation } from './types';
import { generatePDF } from './pdfGenerator';

interface QuotationFormProps {
  quotation?: Quotation;
  onSave?: (data: Omit<Quotation, 'id' | 'code' | 'date'>) => void;
  readOnly?: boolean;
}

export default function QuotationForm({ quotation, onSave, readOnly = false }: QuotationFormProps) {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client>(quotation?.client || {
    name: '',
    brand: '',
    email: '',
    ourRef: '',
    clientRef: '',
    description: '',
    sampleSize: '',
  });

  const [articleImage, setArticleImage] = useState<string>(quotation?.articleImage || '');
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [components, setComponents] = useState<Component[]>(quotation?.components || []);
  const [developments, setDevelopments] = useState<Development[]>(quotation?.developments || []);
  const [quantities, setQuantities] = useState<number[]>(quotation?.quantities || [100, 250, 500]);
  const [margins, setMargins] = useState<number[]>(quotation?.margins || [30, 25, 20]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setArticleImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {
        id: uuidv4(),
        description: '',
        supplier: '',
        unitPrice: 0,
        consumption: 0,
        hasMOQ: false,
      },
    ]);
  };

  const addDevelopment = () => {
    setDevelopments([
      ...developments,
      {
        id: uuidv4(),
        description: '',
        cost: 0,
        isFromMOQ: false,
        showInPdf: true,
      },
    ]);
  };

  const handleMOQChange = (component: Component, hasMOQ: boolean) => {
    if (hasMOQ && !component.moqQuantity) {
      setDevelopments([
        ...developments,
        {
          id: uuidv4(),
          description: `MOQ - ${component.description}`,
          supplier: component.supplier,
          cost: 0,
          moqQuantity: 0,
          isFromMOQ: true,
          includeInSubtotal: false,
          showInPdf: true,
        },
      ]);
    } else if (!hasMOQ) {
      setDevelopments(developments.filter(
        dev => !(dev.isFromMOQ && dev.description === `MOQ - ${component.description}`)
      ));
    }
    
    updateComponent(component.id, 'hasMOQ', hasMOQ);
  };

  const updateComponent = (id: string, field: keyof Component, value: string | number | boolean) => {
    setComponents(
      components.map((comp) => {
        if (comp.id === id) {
          const updatedComp = { ...comp, [field]: value };
          if (field === 'description' && comp.hasMOQ) {
            setDevelopments(developments.map(dev => 
              dev.isFromMOQ && dev.description === `MOQ - ${comp.description}`
                ? { ...dev, description: `MOQ - ${value}` }
                : dev
            ));
          }
          return updatedComp;
        }
        return comp;
      })
    );
  };

  const updateDevelopment = (id: string, field: keyof Development, value: string | number | boolean) => {
    setDevelopments(
      developments.map((dev) =>
        dev.id === id ? { ...dev, [field]: value } : dev
      )
    );
  };

  const removeComponent = (id: string) => {
    const component = components.find(comp => comp.id === id);
    if (component?.hasMOQ) {
      setDevelopments(developments.filter(
        dev => !(dev.isFromMOQ && dev.description === `MOQ - ${component.description}`)
      ));
    }
    setComponents(components.filter((comp) => comp.id !== id));
  };

  const removeDevelopment = (id: string) => {
    const development = developments.find(dev => dev.id === id);
    if (development?.isFromMOQ) {
      const componentDesc = development.description.replace('MOQ - ', '');
      setComponents(components.map(comp => 
        comp.description === componentDesc
          ? { ...comp, hasMOQ: false }
          : comp
      ));
    }
    setDevelopments(developments.filter((dev) => dev.id !== id));
  };

  const calculateLineTotal = (component: Component) => {
    return component.unitPrice * component.consumption;
  };

  const calculateMOQCostPerUnit = (development: Development, quantity: number) => {
    if (development.isFromMOQ && development.includeInSubtotal && development.moqQuantity && development.moqQuantity > 0) {
      return (development.cost * development.moqQuantity) / quantity;
    }
    return 0;
  };

  const calculateSubtotal = (quantity: number) => {
    const componentsTotal = components.reduce((sum, comp) => sum + calculateLineTotal(comp), 0);
    const moqTotal = developments
      .filter(dev => dev.isFromMOQ && dev.includeInSubtotal)
      .reduce((sum, dev) => sum + calculateMOQCostPerUnit(dev, quantity), 0);
    return componentsTotal + moqTotal;
  };

  const calculateDevelopmentTotal = () => {
    return developments
      .filter(dev => !dev.isFromMOQ || !dev.includeInSubtotal)
      .reduce((sum, dev) => sum + dev.cost, 0);
  };

  const calculateQuantityTotal = (quantity: number) => {
    return calculateSubtotal(quantity) * quantity;
  };

  const calculateTotalWithMargin = (quantity: number, margin: number) => {
    const quantityTotal = calculateQuantityTotal(quantity);
    return quantityTotal * (1 + margin / 100);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        client,
        articleImage,
        components,
        developments,
        quantities,
        margins,
      });
      navigate('/');
    }
  };

  const handleExportPDF = () => {
    const data = quotation || {
      client,
      articleImage,
      components,
      developments,
      quantities,
      margins,
      code: 'TEMP',
      date: new Date().toISOString(),
      id: 'TEMP'
    };
    generatePDF(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lomartex, Lda</h1>
          <h2 className="text-xl text-gray-600">
            {quotation ? `Pré-Cotação ${quotation.code}` : 'Nova Pré-Cotação'}
          </h2>
          {quotation && (
            <p className="text-sm text-gray-500 mt-2">
              {new Date(quotation.date).toLocaleDateString('pt-PT')}
            </p>
          )}
        </div>

        {/* Article Image Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Imagem do Artigo</h3>
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={readOnly}
            />
            {!readOnly && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
              >
                <Upload size={16} /> Carregar Imagem
              </button>
            )}
            {articleImage && (
              <div className="relative">
                <div 
                  className="w-32 h-32 border rounded overflow-hidden cursor-pointer"
                  onClick={() => setPreviewOpen(true)}
                >
                  <img
                    src={articleImage}
                    alt="Artigo"
                    className="w-full h-full object-cover"
                  />
                </div>
                {!readOnly && (
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Informação do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do Cliente"
              className="border rounded p-2"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              readOnly={readOnly}
            />
            <input
              type="text"
              placeholder="Marca"
              className="border rounded p-2"
              value={client.brand}
              onChange={(e) => setClient({ ...client, brand: e.target.value })}
              readOnly={readOnly}
            />
            <input
              type="email"
              placeholder="Email"
              className="border rounded p-2"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              readOnly={readOnly}
            />
            <input
              type="text"
              placeholder="Nossa Referência"
              className="border rounded p-2"
              value={client.ourRef}
              onChange={(e) => setClient({ ...client, ourRef: e.target.value })}
              readOnly={readOnly}
            />
            <input
              type="text"
              placeholder="Referência do Cliente"
              className="border rounded p-2"
              value={client.clientRef}
              onChange={(e) => setClient({ ...client, clientRef: e.target.value })}
              readOnly={readOnly}
            />
            <input
              type="text"
              placeholder="Tamanho da Amostra"
              className="border rounded p-2"
              value={client.sampleSize}
              onChange={(e) => setClient({ ...client, sampleSize: e.target.value })}
              readOnly={readOnly}
            />
            <textarea
              placeholder="Descrição"
              className="border rounded p-2 col-span-2"
              rows={3}
              value={client.description}
              onChange={(e) => setClient({ ...client, description: e.target.value })}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Components List */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Lista de Materiais</h3>
            {!readOnly && (
              <button
                onClick={addComponent}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
              >
                <Plus size={16} /> Adicionar Material
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-left">Fornecedor</th>
                  <th className="px-4 py-2 text-right">Preço Unit. (€)</th>
                  <th className="px-4 py-2 text-right">Consumo</th>
                  <th className="px-4 py-2 text-center">Tem MOQ</th>
                  <th className="px-4 py-2 text-right">Total (€)</th>
                  {!readOnly && <th className="px-4 py-2"></th>}
                  }
                </tr>
              </thead>
              <tbody>
                {components.map((component) => (
                  <tr key={component.id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="border rounded p-1 w-full"
                        value={component.description}
                        onChange={(e) =>
                          updateComponent(component.id, 'description', e.target.value)
                        }
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="border rounded p-1 w-full"
                        value={component.supplier}
                        onChange={(e) =>
                          updateComponent(component.id, 'supplier', e.target.value)
                        }
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border rounded p-1 w-full text-right"
                        value={component.unitPrice}
                        onChange={(e) =>
                          updateComponent(component.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border rounded p-1 w-full text-right"
                        value={component.consumption}
                        onChange={(e) =>
                          updateComponent(component.id, 'consumption', parseFloat(e.target.value) || 0)
                        }
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={component.hasMOQ}
                        onChange={(e) => handleMOQChange(component, e.target.checked)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      {calculateLineTotal(component).toFixed(2)}
                    </td>
                    {!readOnly && (
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeComponent(component.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="border-t font-bold">
                  <td colSpan={5} className="px-4 py-2 text-right">Subtotal:</td>
                  <td className="px-4 py-2 text-right">{calculateSubtotal(quantities[0]).toFixed(2)}</td>
                  {!readOnly && <td></td>}
                  }
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Development Costs */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Custos Extra</h3>
            {!readOnly && (
              <button
                onClick={addDevelopment}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
              >
                <Plus size={16} /> Adicionar Custo
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-left">Fornecedor</th>
                  <th className="px-4 py-2 text-right">Custo (€)</th>
                  <th className="px-4 py-2 text-right">MOQ</th>
                  <th className="px-4 py-2 text-center">Incluir no Subtotal</th>
                  <th className="px-4 py-2 text-center">Mostrar no PDF</th>
                  {!readOnly && <th className="px-4 py-2"></th>}
                  }
                </tr>
              </thead>
              <tbody>
                {developments.map((development) => (
                  <tr key={development.id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="border rounded p-1 w-full"
                        value={development.description}
                        onChange={(e) =>
                          updateDevelopment(development.id, 'description', e.target.value)
                        }
                        readOnly={development.isFromMOQ || readOnly}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="border rounded p-1 w-full"
                        value={development.supplier || ''}
                        onChange={(e) =>
                          updateDevelopment(development.id, 'supplier', e.target.value)
                        }
                        readOnly={development.isFromMOQ || readOnly}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border rounded p-1 w-full text-right"
                        value={development.cost}
                        onChange={(e) =>
                          updateDevelopment(development.id, 'cost', parseFloat(e.target.value) || 0)
                        }
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {development.isFromMOQ && (
                        <input
                          type="number"
                          className="border rounded p-1 w-full text-right"
                          value={development.moqQuantity || 0}
                          onChange={(e) =>
                            updateDevelopment(development.id, 'moqQuantity', parseFloat(e.target.value) || 0)
                          }
                          readOnly={readOnly}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {development.isFromMOQ && (
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={development.includeInSubtotal || false}
                          onChange={(e) =>
                            updateDevelopment(development.id, 'includeInSubtotal', e.target.checked)
                          }
                          disabled={readOnly}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={development.showInPdf || false}
                        onChange={(e) =>
                          updateDevelopment(development.id, 'showInPdf', e.target.checked)
                        }
                        disabled={readOnly}
                      />
                    </td>
                    {!readOnly && (
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeDevelopment(development.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="border-t font-bold">
                  <td colSpan={2} className="px-4 py-2 text-right">Total Custos Extra:</td>
                  <td className="px-4 py-2 text-right">{calculateDevelopmentTotal().toFixed(2)}</td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quantities and Margins */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Quantidades e Margens</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600">Quantidade</label>
                    <input
                      type="number"
                      className="border rounded p-2 w-full"
                      value={quantities[index]}
                      onChange={(e) => {
                        const newQuantities = [...quantities];
                        newQuantities[index] = parseInt(e.target.value) || 0;
                        setQuantities(newQuantities);
                      }}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600">Margem (%)</label>
                    <input
                      type="number"
                      className="border rounded p-2 w-full"
                      value={margins[index]}
                      onChange={(e) => {
                        const newMargins = [...margins];
                        newMargins[index] = parseInt(e.target.value) || 0;
                        setMargins(newMargins);
                      }}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded space-y-2">
                  <div className="text-sm text-gray-600">
                    Subtotal: €{calculateSubtotal(quantities[index]).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total para {quantities[index]} unidades: €{calculateQuantityTotal(quantities[index]).toFixed(2)}
                  </div>
                  <div className="text-lg font-semibold">
                    Preço por unidade: €{(calculateTotalWithMargin(quantities[index], margins[index]) / quantities[index]).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Voltar
          </button>
          {!readOnly && (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Guardar
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
          >
            <FileDown size={20} /> Exportar PDF
          </button>
        </div>

        {/* Image Preview Modal */}
        {previewOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setPreviewOpen(false)}
          >
            <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
              <img
                src={articleImage}
                alt="Artigo Preview"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}