import { Modal, FormLayout, TextField, Button } from '@shopify/polaris';
import React from 'react';
import { addStock, updateStock } from '../../../modules/stock';
import { inputCheck } from '../../../utils/inputCheck';

const productAttrs = [
  {
    name: 'imageUrl',
    type: 'image',
  },
  {
    name: 'itemName',
    displayName: 'Name',
    type: 'string',
    notNull: true,
  },
  {
    name: 'itemCode',
    displayName: 'Code',
    type: 'string',
  },
  {
    name: 'itemBarcode',
    displayName: 'Barcode',
    type: 'string',
  },
  {
    name: 'itemCurrentPrice',
    displayName: 'Price',
    type: 'currency',
    min: 0,
  },

  // {
  //   name: 'details',
  //   type: 'json',
  // },
];

export class AddProduct extends React.Component {
  constructor(props, context) {
    super(props);

    this.store = context.store;

    this.isDirty = false;
    this.state = {
      active: false,
    };

    if (props.productInfo) {
      this.state.productInfo = props.productInfo;
    }
  }

  async componentDidUpdate(prevProps, context) {
    //if no user info
    if (this.props !== prevProps) {
      //console.log('Product List update');
      const userInfo = this.props.userInfo;
      const productInfo = this.props.productInfo;
      //console.log('productInfo update', productInfo);
      await this.setState({
        userInfo,
        productInfo,
      });
    }
  }

  node = null;

  async checkAndCompose() {
    let body = {};
    for (let i in productAttrs) {
      let attrName = productAttrs[i].name;
      if (this.state[attrName]) {
        let checkResult = inputCheck(productAttrs[i], this.state[attrName]);

        if (checkResult.status === 'OK') {
          body[attrName] = checkResult.data;
        } else {
          throw new Error(attrName + ' ' + checkResult.msg);
        }
      }
    }
    return body;
  }

  async stateHook(attr, data) {
    await this.setState({ [attr]: data });
    this.isDirty = true;
  }

  async resetAllAttrs() {
    for (let i in productAttrs) {
      let attrName = productAttrs[i].name;
      this.setState({ [attrName]: undefined });
    }

    this.isDirty = false;
  }

  async handleOpen() {
    await this.toggleModal();
    if (this.props.action === 'ADD') {
      await this.setState({
        title: 'Add New Product',
        userInfo: this.props.userInfo,
      });
      for (let i in productAttrs) {
        let attrName = productAttrs[i].name;
        await this.setState({ [attrName]: undefined });
      }
    } else if (this.props.action === 'EDIT') {
      await this.setState({ title: 'Edit Information' });
      for (let i in productAttrs) {
        let attrName = productAttrs[i].name;
        await this.setState({ [attrName]: this.props.productInfo[attrName] });
      }
    }

    this.isDirty = false;
    //console.log('add product state:', this.state);
  }

  async handleClose() {
    await this.resetAllAttrs();
    await this.toggleModal();
  }

  async submit() {
    if (this.isDirty) {
      try {
        let body = await this.checkAndCompose();
        //console.log('body', body);
        if (this.props.action === 'ADD') {
          await addStock(this.state.userInfo.userId, body);
        } else if (this.props.action === 'EDIT') {
          await updateStock(this.state.productInfo.itemId, body);
        }
        await this.toggleModal();
      } catch (err) {
        console.log(err);
      }

      this.props.callBack();
    }

    this.isDirty = false;
  }

  genInputFields() {
    let DOMs = [];

    for (let i in productAttrs) {
      let attrName = productAttrs[i].name;
      let attrDisplayName = productAttrs[i].displayName;
      let attrType = productAttrs[i].type ? productAttrs[i].type : undefined;

      DOMs.push(
        <TextField
          key={'AddProduct_' + attrDisplayName}
          label={attrDisplayName}
          value={this.state[attrName]}
          onChange={async data => this.stateHook(attrName, data)}
          type={attrType}
        />
      );
    }
    return DOMs;
  }

  render() {
    const { active } = this.state;

    return (
      <div
        style={
          {
            //height: '500px'
          }
        }
      >
        <Button primary onClick={() => this.handleOpen()}>
          {this.props.action === 'ADD' ? 'ADD PRODUCT' : 'Edit Information'}
        </Button>
        <Modal
          open={active}
          onClose={this.toggleModal}
          title={this.state.title}
          primaryAction={{
            content: this.props.action === 'ADD' ? 'ADD' : 'EDIT',
            onAction: () => this.submit(),
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => this.handleClose(),
            },
          ]}
        >
          <Modal.Section>
            <FormLayout>{this.genInputFields()}</FormLayout>
          </Modal.Section>
        </Modal>
      </div>
    );
  }

  handleClick = () => {
    if (this.node == null) {
      return;
    }
    this.node.input.focus();
  };

  handleFocus = () => {
    if (this.node == null) {
      return;
    }
    this.node.input.select();
    document.execCommand('copy');
  };

  toggleModal = () => {
    this.setState(({ active }) => ({ active: !active }));
  };

  bindNode = node => {
    if (node == null) {
      return;
    }
    this.node = node;
  };
}
