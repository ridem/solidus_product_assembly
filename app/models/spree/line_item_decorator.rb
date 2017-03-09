module Spree
  LineItem.class_eval do
    scope :assemblies, -> { joins(product: :parts).distinct }

    def any_units_shipped?
      inventory_units.any?(&:shipped?)
    end

    # The parts that apply to this particular LineItem. Usually `product#parts`, but
    # provided as a hook if you want to override and customize the parts for a specific
    # LineItem.
    delegate :parts, to: :product

    # The number of the specified variant that make up this LineItem. By default, calls
    # `product#count_of`, but provided as a hook if you want to override and customize
    # the parts available for a specific LineItem. Note that if you only customize whether
    # a variant is included in the LineItem, and don't customize the quantity of that part
    # per LineItem, you shouldn't need to override this method.
    delegate :count_of, to: :product

    def quantity_by_variant
      if product.assembly?
        {}.tap { |hash| product.assemblies_parts.each { |ap| hash[ap.part] = ap.count * quantity } }
      else
        { variant => quantity }
      end
    end

    private

    def update_inventory
      if (changed? || target_shipment.present?) && order.has_checkout_step?('delivery')
        if product.assembly?
          OrderInventoryAssembly.new(self).verify(target_shipment)
        else
          OrderInventory.new(order, self).verify(target_shipment)
        end
      end
    end
  end
end
