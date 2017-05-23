class Spree::Admin::PartsController < Spree::Admin::BaseController
  before_action :find_product

  def index
    @parts = @product.assemblies_parts.includes(:assembly, :part)
  end

  def remove
    assembly_part = Spree::AssembliesPart.find(params[:id])
    assembly_part.destroy
    render 'spree/admin/parts/update_parts_table'
  end

  def set_count
    save_part(existing_part_params)
  end

  def available
    if params[:q].blank?
      @available_products = []
    else
      query = "%#{params[:q]}%"
      @available_products = Spree::Product.search_can_be_part(query)
      @available_products.uniq!
    end
    respond_to do |format|
      format.html { render layout: false }
      format.js { render layout: false }
    end
  end

  def create
    save_part(new_part_params)
  end

  private

  def save_part(part_params)
    logger.info part_params
    # binding.pry
    form = Spree::AssignPartToBundleForm.new(@product, part_params)
    logger.info form
    if form.submit
      render 'spree/admin/parts/update_parts_table'
    else
      error_message = form.errors.full_messages.to_sentence
      render json: error_message.to_json, status: 422
    end
  end

  def model_class
    Spree::AssembliesPart
  end

  def find_product
    @product = Spree::Product.find_by(slug: params[:product_id])
  end

  def new_part_params
    params.require(:assemblies_part).permit(
      :count,
      :part_id,
      :assembly_id,
      :variant_selection_deferred
    )
  end

  def existing_part_params
    params.permit(:id, :count)
  end
end
