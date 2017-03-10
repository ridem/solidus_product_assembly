module Spree
  module Stock
    InventoryUnitBuilder.class_eval do
      def units
        @order.line_items.flat_map do |line_item|
          line_item.quantity_by_variant.flat_map do |variant, quantity|
            Array.new(quantity) { build_inventory_unit(variant, line_item) }
          end
        end
      end

      def build_inventory_unit(variant, line_item)
        Spree::InventoryUnit.new(
          pending: true,
          variant: variant,
          line_item: line_item,
          order: @order
        )
      end
    end
  end
end
