module Spree
  module Stock
    # Overridden from spree core to make it also check for assembly parts stock
    class AvailabilityValidator < ActiveModel::Validator
      def validate(line_item)
        line_item.quantity_by_variant.each do |variant, variant_quantity|
          inventory_units = line_item.inventory_units.where(variant: variant).count
          quantity = variant_quantity - inventory_units

          next if quantity <= 0
          next unless variant

          quantifier = Stock::Quantifier.new(variant)

          next if quantifier.can_supply? quantity
          display_name = variant.name.to_s
          display_name += %{ (#{variant.options_text})} unless variant.options_text.blank?

          line_item.errors[:quantity] << Spree.t(
            :selected_quantity_not_available,
            item: display_name.inspect
          )
        end
      end
    end
  end
end
